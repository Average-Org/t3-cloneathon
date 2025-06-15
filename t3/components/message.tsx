import Markdown from "@/utils/markdown";
import { UIMessage } from "ai";
import { memo, useState } from "react";

export const Message = memo(({ message }: { message: UIMessage }) => {
    const [hovering, setHovering] = useState(false);
  
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
          {message.parts?.map((m, i) => {
            switch (m.type) {
              case "text":
                return <Markdown key={`${message.id}-${i}`} text={m.text} />;
            }
          })}
        </article>
      </div>
    </div>
  );
});
