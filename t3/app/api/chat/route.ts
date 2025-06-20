﻿// app/api/chat/route.ts or pages/api/chat.ts
import { openai } from "@ai-sdk/openai";
import { anthropic, AnthropicProviderOptions } from "@ai-sdk/anthropic";
import {
  streamText,
  createDataStreamResponse,
  LanguageModelV1,
  Message,
  ToolSet,
} from "ai";
import { createClient } from "@/utils/supabase/server";
import {
  getModelSearchDefinition,
  ModelSearchDefinition,
} from "@/lib/model-search-awareness";
import { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google/internal";
import { google } from "@ai-sdk/google";
import { Tables } from "@/database.types";

interface ProviderResult {
  model: LanguageModelV1;
  provider: string;
  searchCapability?: ModelSearchDefinition;
}

function getProvider(model: string, search: boolean): ProviderResult {
  const provider: ProviderResult = {
    model: openai("gpt-4o"),
    provider: "openai",
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
    provider.model = openai.responses(modelToUse);
    provider.provider = "openai";
  } else if (
    modelToUse.includes("claude") ||
    modelToUse.includes("anthropic")
  ) {
    provider.model = anthropic(modelToUse);
    provider.provider = "anthropic";
  } else if (modelToUse.includes("gemini")) {
    provider.model = google(modelToUse, {
      useSearchGrounding: search,
    });
    provider.provider = "google";
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }

  return provider;
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = await req.json();
  const { messages }: { messages: Message[] } = body;
  const { data } = body;
  const {
    conversationId: conversation,
    model,
    search,
    reasoning,
    userSettings,
  } = data;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(
    user?.email +
      ` sent a ${
        search ? "web-search" : "non-search"
      } request to AI (${model}) route in conversation ID: ` +
      conversation
  );

  const typedUserSettings = userSettings as Tables<"usersettings">;
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

  interface Tool {
    type?: string;
    name?: string;
    max_uses?: number;
    [key: string]: unknown;
  }

  const tools: Tool[] = [];

  const provider = getProvider(model, search);
  if (search && provider.provider === "openai") {
    tools.push(openai.tools.webSearchPreview());
  } else if (search && provider.provider === "anthropic") {
    tools.push({
      type: "web_search_20250305",
      name: "web_search",
      max_uses: 5,
    });
  }

  const providerOptions: {
    openai?: { reasoningEffort: string };
    anthropic?: AnthropicProviderOptions;
    google?: GoogleGenerativeAIProviderOptions;
  } = {};
  if (reasoning && provider.provider === "openai") {
    providerOptions.openai = { reasoningEffort: "high" };
  } else if (reasoning && provider.provider === "anthropic") {
    providerOptions.anthropic = {
      thinking: { type: "enabled", budgetTokens: 12000 },
    } satisfies AnthropicProviderOptions;
  } else if (reasoning && provider.provider === "google") {
    providerOptions.google = {
      thinkingConfig: {
        includeThoughts: true,
      },
    } satisfies GoogleGenerativeAIProviderOptions;
  }

  return createDataStreamResponse({
    execute: async (stream) => {
      const result = streamText({
        model: provider.model,
        tools: tools as unknown as ToolSet,
        providerOptions: providerOptions,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant. 
              Answer the user's questions and be their friend.
              ${
                typedUserSettings?.name
                  ? `The user's name is ${typedUserSettings.name}.`
                  : ""
              }
              ${
                typedUserSettings?.job
                  ? `The user's profession is ${typedUserSettings.job}.`
                  : ""
              }
              ${
                typedUserSettings?.traits
                  ? `The user wants you to have the following traits: ${
                      Array.isArray(typedUserSettings.traits)
                        ? typedUserSettings.traits.join(", ")
                        : String(typedUserSettings.traits)
                    }.`
                  : ""
              } 
              ${
                typedUserSettings?.additional_info
                  ? `The user has provided additional information: ${typedUserSettings.additional_info}.`
                  : ""
              }
              Please format your messages with Markdown.`,
          },
          ...messages,
        ],
        onError: (error) => {
          console.error("Error during streaming:", error);
          errorHandler(error);
        },
        toolCallStreaming: true,
        onFinish: async (message) => {
          const { error } = await supabase.from("messages").insert({
            message: message.text,
            assistant: true,
            conversation: conversation,
            sources: message.sources,
            reasoning: message.reasoning,
          });

          console.log(message);

          if (error) {
            console.error("Error inserting message:", error);
            return;
          }

          if (conversationData.name === "New Chat") {
            try {
              const titleResult = await streamText({
                model: provider.model,
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

      result.mergeIntoDataStream(stream, {
        sendReasoning: true,
        sendUsage: true,
        sendSources: true,
      });
    },
    onError: (error) => {
      return errorHandler(error);
    },
  });

  function errorHandler(error: unknown): string {
    if (error == null) {
      console.error("unknown error");
      return "unknown error";
    }

    if (typeof error === "string") {
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
}
