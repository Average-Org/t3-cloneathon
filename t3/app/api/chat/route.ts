// app/api/chat/route.ts or pages/api/chat.ts
import { openai } from "@ai-sdk/openai";
import { streamText, createDataStreamResponse } from "ai";

export async function POST(req: Request) {
    const { messages, model } = await req.json();

    return createDataStreamResponse({
        execute: async (stream) => {
            const result = streamText({
                model: openai("gpt-4o"), // Consider using the 'model' variable here if you want to allow dynamic model selection
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant. Answer the user's questions and be their friend. Please format your messages with Markdown.",
                    },
                    ...messages
                ],
                onError: handleError,
            });

            result.mergeIntoDataStream(stream);
        },
    });
}

function handleError(error: unknown){
    console.error(error);
}