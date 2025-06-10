"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react";
import { Heading } from "@/components/heading";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  PaperClipIcon,
  GlobeAltIcon,
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
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { title } from "process";

interface HomeClientProps {
  chatId?: string;
}

export default function HomeClient({ chatId }: HomeClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: "/api/chat",
    credentials: "include",
  });
  const [currentChatId, setChatId] = useState<string | null>(chatId || null);

  function handleKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.code === "Enter" && !event.shiftKey) {
      event.preventDefault();
      insertMessage();
    }
  }

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? "";
  }

  function insertMessage() {
    const insert = async () => {
      const { data, error } = await supabase.from("messages").insert({
        message: input,
        assistant: false,
        conversation: currentChatId,
      });

      if (error) {
        console.error("Error inserting message:", error);
        return;
      }

      handleSubmit({}, { headers: { Authorization: `Bearer ${await getAccessToken()}` }, data: { conversationId: currentChatId } });
    };

    insert();
  }

  useEffect(() => {
    const createChat = async () => {
      if (chatId) {
        setChatId(chatId);
        console.log("Using existing chat ID:", chatId);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("conversations")
        .insert({ name: "New Chat", user: userData?.user?.id })
        .select()
        .single();

      if (error) {
        console.error("Error creating chat:", error);
        return;
      }

      if (data) {
        setChatId(data.id);
        console.log("New chat created with ID:", data.id);
      } else {
        console.error("No chat data returned after creation.");
      }
    };

    createChat();
  }, [chatId]);

  return (
    <div className={``}>
      <SidebarProvider>
        <AppSidebar
          isSidebarOpen={sidebarOpen}
          changeSidebarState={setSidebarOpen}
        >
          <div className={`flex flex-col grow justify-between h-full`}>
            {messages.length < 1 && (
              <div className={`flex justify-center items-center grow`}>
                <Heading className={`text-3xl`}>How can I help you?</Heading>
              </div>
            )}

            {messages.length > 0 && (
              <div
                className={`flex flex-col mt-16 items-center gap-8 grow max-h-[80vh] py-12 overflow-y-auto`}
              >
                {error && (
                  <div
                    className={`flex justify-center items-center max-w-[80%]`}
                  >
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
                  <Button
                    onClick={insertMessage}
                    variant={"outline"}
                    className={`absolute bottom-2 right-3 rounded-3xl !px-[0.75rem]`}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <div className={`absolute bottom-2 left-3 flex gap-2`}>
                    <Select>
                      <SelectTrigger>
                        <BotIcon />
                        <SelectValue placeholder={"Automatic"} />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={`gpt-4o`}>GPT 4o</SelectItem>

                        <SelectItem value={`claude-3.7-sonnet`}>
                          Claude 3.7 Sonnet
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
        </AppSidebar>
      </SidebarProvider>
    </div>
  );
}
