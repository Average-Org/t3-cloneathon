// app/api/chat/route.ts or pages/api/chat.ts
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  streamText,
  createDataStreamResponse,
  LanguageModelV1,
  Message,
} from "ai";
import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";
import {
  getModelSearchDefinition,
  ModelSearchDefinition,
} from "@/lib/model-search-awareness";

interface ProviderResult {
  model: LanguageModelV1;
  searchCapability?: ModelSearchDefinition;
}

function getProvider(model: string, search: boolean) {
  const provider: ProviderResult = {
    model: openai("gpt-4o"),
  };

  provider.searchCapability = getModelSearchDefinition(model);

  let modelToUse = "gpt-4o";
  if (
    provider.searchCapability.canDoWebSearch &&
    search &&
    provider.searchCapability.modelSearchName
  ) {
    modelToUse = provider.searchCapability.modelSearchName;
  } else {
    modelToUse = provider.searchCapability.modelName;
  }

  if (
    modelToUse.includes("gpt") ||
    modelToUse.includes("openai") ||
    modelToUse.startsWith("o")
  ) {
    return openai(modelToUse);
  } else if (
    modelToUse.includes("claude") ||
    modelToUse.includes("anthropic")
  ) {
    return anthropic(modelToUse);
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = await req.json();
  console.log(body);
  const { messages }: {messages: Message[] } = body;
  const { data } = body;
  const { conversationId: conversation, model, search, attachments } = data;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  console.log(
    user?.email +
      ` sent a ${
        search ? "web-search" : "non-search"
      } request to AI (${model}) route in conversation ID: ` +
      conversation
  );
  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversation)
    .single();

  if (conversationError) {
    console.error("Error fetching conversation:", conversationError);
    return new Response("Error fetching conversation", { status: 500 });
  }

  if (!conversationData) {
    console.error("No conversation found with ID:", conversationData);
    return new Response("Conversation not found", { status: 404 });
  }

  if (conversationData.user !== user?.id) {
    console.error("User does not have permission to access this conversation");
    return new Response("Unauthorized", { status: 403 });
  }

  return createDataStreamResponse({
    execute: async (stream) => {
      const result = streamText({
        model: getProvider(model, search),
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Answer the user's questions and be their friend. Please format your messages with Markdown.",
          },
          ...messages,
        ],
        onError: (error) => {
          console.error("Error during streaming:", error);
          errorHandler(error);
        },
        onFinish: async (message) => {
          const { data, error } = await supabase.from("messages").insert({
            message: message.text,
            assistant: true,
            conversation: conversation,
          });

          if (error) {
            console.error("Error inserting message:", error);
            return;
          }

          if (conversationData.name === "New Chat") {
            try {
              const titleResult = await streamText({
                model: getProvider(model, search),
                onError: (error) =>
                  console.error("Error generating conversation name: " + error),
                onFinish: async (titleMessage) => {
                  console.log(
                    "Generated conversation name:",
                    titleMessage.text + " for conversation ID: " + conversation
                  );

                  const { error } = await supabase
                    .from("conversations")
                    .update({ name: titleMessage.text })
                    .eq("id", conversation);

                  if (error) {
                    console.error("Error updating conversation name:", error);
                    return;
                  }
                  console.log(
                    "Conversation name updated successfully:",
                    titleMessage.text
                  );
                },
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant. Summarize this chat in 3-6 words. Return only the title. No quotes, no explanations.",
                  },
                  ...messages,
                ],
              });

              // wait for the stream to complete
              await titleResult.consumeStream(stream);
            } catch (e) {
              console.error("Error during title generation:", e);
            }
          }
        },
      });

      result.mergeIntoDataStream(stream);
    },
    onError: (error) => {
      return errorHandler(error);
    }
  });
}

export function errorHandler(error: unknown): string {
  if (error == null) {
    console.error('unknown error');
    return 'unknown error';
  }

  if (typeof error === 'string') {
    console.error(error);
    return error;
  }

  if (error instanceof Error) {
    console.error(error.message);
    return error.message;
  }

  const errorString = JSON.stringify(error);
  console.error(errorString);
  return errorString;
}
