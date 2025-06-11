// app/api/chat/route.ts or pages/api/chat.ts
import { openai } from "@ai-sdk/openai";
import { streamText, createDataStreamResponse } from "ai";
import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const supabase = await createClient();

  const body = await req.json();
  console.log(body);
  const { messages, model } = body;
  const { conversationId: conversation } = body.data;
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
        model: openai("gpt-4o"),
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
