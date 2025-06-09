"use client";

import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Children, useState} from "react";
import {Heading} from "@/components/heading";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {ArrowUpIcon} from "@heroicons/react/24/outline";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AlertCircleIcon, BotIcon} from "lucide-react";
import {useChat} from "@ai-sdk/react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Markdown from "@/utils/markdown";

export default function HomeClient() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const {messages, input, handleInputChange, handleSubmit, error} = useChat();

    function handleKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if(event.code === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    }

    return (<div className={``}>
        <SidebarProvider>
            <AppSidebar isSidebarOpen={sidebarOpen} changeSidebarState={setSidebarOpen}>
                <div className={`flex flex-col grow justify-between h-full`}>
                    {messages.length < 1 && (
                        <div className={`flex justify-center items-center grow`}>
                            <Heading className={`text-3xl`}>
                                How can I help you?
                            </Heading>
                        </div>
                    )}

                    {messages.length > 0 && (
                        <div className={`flex flex-col mt-16 items-center gap-8 grow max-h-[80vh] py-12 overflow-y-auto`}>
                        {error && (
                            <div className={`flex justify-center items-center max-w-[80%]`}>
                                <Alert variant={"destructive"} className={`shrink`}>
                                    <AlertCircleIcon/>
                                    <AlertTitle>{error.message}</AlertTitle>
                                    <AlertDescription className={`wrap-normal`}>
                                        <p>
                                            {error.stack?.toString() || "An unexpected error occurred."}
                                        </p>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {messages.map(message => (
                            <div key={message.id}
                                 className={`flex w-full max-w-[80%] ${message.role === 'user' && ('justify-end')} `}>
                                <div className={`whitespace-pre-wrap max-w-[70%] ${message.role === 'user' && ('bg-accent/75 ')} p-4 rounded-xl`}>
                                    <article className={`whitespace-normal `}>
                                        {message.parts.map((part, i) => {
                                            switch (part.type) {
                                                case 'text':
                                                    return <Markdown key={`${message.id}-${i}`} text={part.text} />;
                                            }
                                        })}
                                    </article>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}


                    <div className={`flex justify-center items-center`}>
                        <div className={`w-[50%]`}>
                            <div className={`relative `}>
                                <Textarea onKeyDown={handleKey} value={input} onChange={handleInputChange}
                                          className={`h-28 p-5 border-b-0 rounded-b-none resize-none`}
                                          placeholder={`Type your message here...`}>

                                </Textarea>
                                <Button onClick={handleSubmit} variant={"outline"}
                                        className={`absolute bottom-2 right-3 rounded-3xl !px-[0.75rem]`}>
                                    <ArrowUpIcon/>
                                </Button>

                                <div className={`absolute bottom-2 left-3`}>
                                    <Select>
                                        <SelectTrigger>
                                            <BotIcon/>
                                            <SelectValue placeholder={"Automatic"}/>
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value={`gpt-4o`}>
                                                GPT 4o
                                            </SelectItem>

                                            <SelectItem value={`claude-3.7-sonnet`}>
                                                Claude 3.7 Sonnet
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppSidebar>
        </SidebarProvider>
    </div>)
        ;
}