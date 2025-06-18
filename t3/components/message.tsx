import Markdown from "@/utils/markdown";
import RenderMarkdown from "@/utils/reasoning";
import { UIMessage } from "ai";
import Link from "next/link";
import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const Message = memo(({ message }: { message: UIMessage }) => {
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const textToCopy = message.content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  console.log(message);
  // sort message parts by type, "file" first
  const filesAndTextParts = useMemo(() => {
    if (!message.parts) return [];
    return [...message.parts]
      .filter(
        (part) =>
          part.type === "file" ||
          part.type === "text" ||
          part.type === "reasoning"
      )
      .sort((a, b) => {
        if (a.type === "file" && b.type !== "file") return -1;
        if (b.type === "file" && a.type !== "file") return 1;
        return 0;
      });
  }, [message.parts]);

  const sources = useMemo(() => {
    if (!message.parts) return [];
    return [...message.parts].filter((part) => part.type === "source");
  }, [message.parts]);

  return (
    <div
      className={`flex flex-col w-full max-w-[80%] `}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={`w-full flex ${message.role === "user" && "justify-end"}`}
        key={message.id}
      >
        <div
          className={`whitespace-pre-wrap max-w-[70%] ${
            message.role === "user" && "bg-accent/75 "
          } px-4 py-2 rounded-xl shadow-md transition-all duration-300 ease-out`}
        >
          <article className={`whitespace-normal `}>
            {message.experimental_attachments?.map((attachment, i) => {
              if (attachment.contentType?.startsWith("image/")) {
                return (
                  <img
                    key={`${message.id}-attachment-${i}`}
                    src={attachment.url}
                    alt="Attachment"
                    className="max-w-[15rem] rounded-lg mb-2"
                  />
                );
              }
              return null;
            })}

            {filesAndTextParts.map((m, i) => {
              switch (m.type) {
                case "reasoning":
                  return (
                    <RenderMarkdown
                      key={`${message.id}-${i}`}
                      text={m.reasoning}
                    />
                  );
                case "text":
                  return <Markdown key={`${message.id}-${i}`} text={m.text} />;
                case "file":
                  const data = m.data;
                  if (m.mimeType?.startsWith("image/")) {
                    return (
                      <img
                        key={`${message.id}-${i}`}
                        src={data}
                        alt="Attachment"
                        className="max-w-[15rem] rounded-lg mb-2"
                      />
                    );
                  }
              }
            })}

            {sources.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2 flex gap-2 flex-row wrap-anywhere overflow-y-auto">
                {sources.map((source, i) => (
                  <Link
                    href={source.source.url}
                    className="hover:text-blue-400"
                    key={i}
                  >
                    {source.source.title}
                  </Link>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>

      <div
        className={`flex flex-row ${message.role === "user" && "justify-end"} ${
          hovering ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300 ease-out`}
      >
        <Button size="icon" variant="ghost" onClick={handleCopy}>
          <Copy className="" />
        </Button>
        <div className="text-sm mt-1 text-muted-foreground text-center">
          {copied ? "Copied!" : ""}
        </div>
      </div>
    </div>
  );
});

Message.displayName = "Message";
export default Message;