// app/api/chat/route.ts or pages/api/chat.ts
import { openai } from "@ai-sdk/openai";
import { streamText, createDataStreamResponse } from "ai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  console.log(req);
  const { messages, conversation, model } = await req.json();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  console.log("user in server route ➜", user?.id, error);

  return createDataStreamResponse({
    execute: async (stream) => {
      const result = streamText({
        model: openai(model),
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
