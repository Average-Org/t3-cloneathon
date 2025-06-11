// app/api/chat/route.ts or pages/api/chat.ts
import { openai } from "@ai-sdk/openai";
import { anthropic } from '@ai-sdk/anthropic';
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
  const { conversationId: conversation, model } = data;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log(
    user?.email + " sent a request to AI route in conversation: " + conversation
  );
  return createDataStreamResponse({
    execute: async (stream) => {
      const result = streamText({
        model: getModel(model),
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Answer the user's questions and be their friend. Please format your messages with Markdown.",
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
        },
      });

      result.mergeIntoDataStream(stream);
    },
  });
}

function handleError(error: unknown) {
  console.error(error);
}
