import React, {useState} from "react";
import {ExtraProps} from "react-markdown";
import {Button} from "@/components/ui/button";
import {ClipboardCopyIcon} from "lucide-react";

export default function CodeBlock({
                                      className,
                                      ...p
                                  }: React.ClassAttributes<HTMLPreElement> & React.HTMLAttributes<HTMLPreElement> & ExtraProps) {
    const langFromClass = /language-(\w+)/.exec(className || '')?.[1]
    const language = langFromClass || 'plaintext'
    const [showActions, setActions] = useState(false);

    return (
        <div onMouseEnter={() => setActions(true)} onMouseLeave={() => setActions(false)} className={`flex flex-col`}>
            <div className={`bg-muted-foreground/30 p-2 rounded-t pl-4 font-mono text-sm flex items-center gap-2 text-foreground`}>
                <span>
                    {language}
                </span>

                {showActions && (
                    <div className={`ml-auto flex gap-2`}>
                        <Button variant={"ghost"} className={"px-4 py-2 !m-none size-5"}>
                            <ClipboardCopyIcon  />
                        </Button>
                    </div>
                )}
            </div>
            <code {...p} className="mb-4 py-4 overflow-x-auto bg-sidebar/60 p-4 "/>
        </div>
    )
}