"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { useCallback, useEffect, useState } from "react";
import { Heading } from "@/components/heading";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  PaperClipIcon,
  GlobeAltIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircleIcon, BotIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Markdown from "@/utils/markdown";
import { supabase } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import UserFullName from "@/components/Username";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { useConversationCtx } from "@/lib/conversation-context";

interface HomeClientProps {
  chatId?: string;
}

export default function HomeClient({ chatId }: HomeClientProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    isLoading,
    stop,
  } = useChat({
    api: "/api/chat",
    credentials: "include",
  });
  const router = useRouter();
  const { setTitle, setCurrentConversationId } = useSidebar();
  const user = useCurrentUser();
  const [chatIdFromUrl, setChatIdFromUrl] = useState<string | null | undefined>(
    chatId
  );

  function handleKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.code === "Enter" && !event.shiftKey) {
      event.preventDefault();
      insertMessage();
    }
  }

  const conversation = useConversationCtx();

  useEffect(() => {
    if (!user.user && !user.isLoading) {
      router.push("/login");
    }
  }, [user]);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.loading]);

  const insertMessage = useCallback(async () => {
    let id = conversation.chat?.id;

    if (!id) {
      const chat = await conversation.createChat();
      id = chat?.id;
    }

    if(!id){
      throw new Error("Conversation ID was null when trying to insert message");
    }

    const { error } = await supabase.from("messages").insert({
      message: input,
      assistant: false,
      conversation: id,
    });

    if (error) {
      console.error("Error inserting message:", error);
      return;
    }

    handleSubmit({}, { data: { conversationId: id, model: selectedModel } });
  }, [conversation.chat?.id, input, handleSubmit, selectedModel]);

  return (
    <div className={`flex h-full w-full flex-col max-h-[calc(100vh-5rem)]`}>
      <div className={`flex flex-col grow justify-between h-full`}>
        {messages.length < 1 && (
          <div
            className={`flex justify-center items-center grow ${
              conversation.loading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-500`}
          >
            <Heading className={`text-3xl`}>How can I help you,&nbsp;</Heading>
            <UserFullName className="text-3xl font-bold" />
            <h1 className="text-3xl font-bold">!</h1>
          </div>
        )}

        {messages.length > 0 && (
          <div
            className={`flex flex-col items-center gap-8 grow max-h-[80vh] py-12 overflow-y-auto transition-all duration-500`}
          >
            {error && (
              <div className={`flex justify-center items-center max-w-[80%]`}>
                <Alert variant={"destructive"} className={`shrink`}>
                  <AlertCircleIcon />
                  <AlertTitle>{error.message}</AlertTitle>
                  <AlertDescription className={`wrap-normal`}>
                    <p>
                      {error.stack?.toString() ||
                        "An unexpected error occurred."}
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full max-w-[80%] ${
                  message.role === "user" && "justify-end"
                } `}
              >
                <div
                  className={`whitespace-pre-wrap max-w-[70%] ${
                    message.role === "user" && "bg-accent/75 "
                  } px-4 py-2 rounded-xl`}
                >
                  <article className={`whitespace-normal `}>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <Markdown
                              key={`${message.id}-${i}`}
                              text={part.text}
                            />
                          );
                      }
                    })}
                  </article>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`flex justify-center items-center`}>
          <div className={`w-[60%]`}>
            <div className={`relative `}>
              <Textarea
                onKeyDown={handleKey}
                value={input}
                onChange={handleInputChange}
                className={`h-28 p-5 border-b-0 rounded-b-none resize-none`}
                placeholder={`Type your message here...`}
              ></Textarea>

              {isLoading ? (
                <Button
                  onClick={stop}
                  variant={"outline"}
                  className={`absolute bottom-2 right-3 rounded-3xl !px-[0.75rem]`}
                >
                  <XMarkIcon className="h-5 w-5" />{" "}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant={"outline"}
                  className={`absolute bottom-2 right-3 rounded-3xl !px-[0.75rem]`}
                >
                  <ArrowUpIcon />
                </Button>
              )}
              <div className={`absolute bottom-2 left-3 flex gap-2`}>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <BotIcon />
                    <SelectValue placeholder={"Automatic"} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={`gpt-4o`}>GPT 4o</SelectItem>

                    <SelectItem value={`claude-3-5-sonnet-20241022`}>
                      Claude 3.5 Sonnet
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={"outline"}
                  className={`rounded-3xl !px-[0.75rem]`}
                >
                  <GlobeAltIcon />
                  Search
                </Button>
                <Button
                  variant={"outline"}
                  className={`rounded-3xl !px-[0.75rem]`}
                >
                  <PaperClipIcon className="stroke-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
