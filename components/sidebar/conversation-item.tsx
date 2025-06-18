import { memo } from "react";
import { Button } from "@/components/ui/button";

export const ConversationItem = memo(function ConversationItem({
  id,
  name,
  active,
  onClick,
}: {
  id: string;
  name: string;
  active: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <Button
      className={`!bg-transparent cursor-pointer text-muted-foreground whitespace-nowrap !px-4 !py-2 text-md transition-all hover:!bg-muted-foreground/30 justify-start hover:text-foreground w-full
                    ${active ? "!bg-muted-foreground/30 text-foreground" : ""}`}
      onClick={() => onClick(id)}
    >
      <span className="truncate">{name || "Untitled Chat"}</span>
    </Button>
  );
});
