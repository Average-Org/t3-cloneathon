import React, {useState} from "react";
import {ExtraProps} from "react-markdown";
import {Button} from "@/components/ui/button";
import {ClipboardCopyIcon} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {toString} from 'hast-util-to-string';  
import type { Element as HastElement } from 'hast';

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  node?: HastElement;        
}

export default function CodeBlock({
                                    node,
                                      className,
                                      ...p
                                  }: CodeBlockProps & ExtraProps) {
    const langFromClass = /language-(\w+)/.exec(className || '')?.[1]
    const language = langFromClass || 'plaintext'

    function copyToClipboard() {
        if(!node){
            console.warn("No node provided for copying to clipboard.");
            return;
        }
        console.log("Copying code to clipboard:", toString(node).toString());
        navigator.clipboard.writeText(toString(node).toString() || '')

    }

    return (
        <div className={`flex flex-col`}>
            <div className={`bg-muted-foreground/30 p-2 rounded-t pl-4 font-mono text-sm flex items-center gap-2 text-foreground`}>
                <span>
                    {language}                
                </span>
                    <div className={`ml-auto flex gap-2`}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={copyToClipboard} variant={"ghost"} className={"px-4 py-2 !m-none size-5"}>
                                    <ClipboardCopyIcon  />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy to clipboard</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
            </div>
            <code {...p} className="mb-4 py-4 overflow-x-auto bg-sidebar/60 p-4 "/>
        </div>
    )
}