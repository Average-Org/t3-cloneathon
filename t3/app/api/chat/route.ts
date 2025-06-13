// app/api/chat/route.ts or pages/api/chat.ts
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, createDataStreamResponse } from "ai";
import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";

function getModel(model: string) {
  if (!model) {
    console.warn("Model not specified, defaulting to gpt-4o");
    model = "gpt-4o";
  }

  if (model.includes("gpt") || model.includes("openai")) {
    return openai(model);
  } else if (model.includes("claude") || model.includes("anthropic")) {
    return anthropic(model);
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = await req.json();
  console.log(body);
  const { messages, data } = body;
  const { conversationId: conversation, model, search } = data;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log(
    user?.email +
      " sent a request to AI route in conversation ID: " +
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
        model: getModel(model),
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Answer the user's questions and be their friend. Please format your messages with Markdown.",
            tools: {
                web_search_preview: search ? openai.tools.webSearchPreview() : undefined, 
            }
          },
          ...messages,
        ],
        onError: handleError,
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
                model: getModel(model),
                onError: (error) =>
                  console.error("Error generating conversation name: " + error),
                onFinish: async (titleMessage) => {
                  console.log(
                    "Generated conversation name:",
                    titleMessage.text + " for conversation ID: " + conversation
                  );

                  const {error} = await supabase
                    .from("conversations")
                    .update({ name: titleMessage.text })
                    .eq("id", conversation);

                  if (error) {
                    console.error("Error updating conversation name:", error);
                    return;
                  }
                  console.log("Conversation name updated successfully:", titleMessage.text);
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
  });
}

function handleError(error: unknown) {
  console.error(error);
}
