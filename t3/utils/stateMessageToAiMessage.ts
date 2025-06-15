import { UploadedFile } from "@/app/home-client";
import { Tables } from "@/database.types";
import { FilePart, Message, TextPart } from "ai";



export const stateMessageToAiMessage = (m: Tables<"messages">): Message => {
  console.log(m);
  const parts = [];

  if(m.message) {
    parts.push({ type: "text", text: m.message } as TextPart);
  }

  if(m.attachments && typeof m.attachments === "string") {
    const attachments = JSON.parse(m.attachments);

    attachments.forEach((attachment: UploadedFile) => {
      parts.push({
        type: "file",
        data: attachment.url, // or the actual file data if available
        mimeType: attachment.type || "application/octet-stream"
      } as FilePart);
    });
  }

  return {
    id: String(m.id),
    role: m.assistant ? "assistant" : "user",
    parts: parts,
    createdAt: m.created_at ? new Date(m.created_at) : new Date(),
    content: m.message ?? "",
  };
};
