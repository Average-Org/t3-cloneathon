import { Tables } from "@/database.types";
import { Message } from "ai";

export const stateMessageToAiMessage = (m: Tables<"messages">): Message => {
  return {
    id: String(m.id),
    role: m.assistant ? "assistant" : "user",
    parts: m.message ? [{ type: "text", text: m.message }] : [],
    createdAt: m.created_at ? new Date(m.created_at) : new Date(),
    content: m.message ?? "",
  };
};
