import Markdown from "@/utils/markdown";
import { FilePart, UIMessage } from "ai";
import { memo, useMemo, useState } from "react";

export const Message = memo(({ message }: { message: UIMessage }) => {
  const [hovering, setHovering] = useState(false);

  // sort message parts by type, "file" first
  const sortedParts = useMemo(() => {
    if (!message.parts) return [];
    return [...message.parts].sort((a, b) => {
      if (a.type === "file" && b.type !== "file") return -1;
      if (b.type === "file" && a.type !== "file") return 1;
      return 0;
    });
  }, [message.parts]);

  return (
    <div
      key={message.id}
      className={`flex w-full max-w-[80%] ${
        message.role === "user" && "justify-end"
      } `}
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

          {sortedParts.map((m, i) => {
            switch (m.type) {
              case "text":
                return <Markdown key={`${message.id}-${i}`} text={m.text} />;
              case "file":
                const data = m.data as any;
                if(m.mimeType?.startsWith("image/")) {
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
        </article>
      </div>
    </div>
  );
});
