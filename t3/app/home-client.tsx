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
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { title } from "process";
import { set } from "zod";
import UserFullName from "@/components/Username";

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
      let chatIdToUse = currentChatId;
      if (!chatIdToUse) {
        chatIdToUse = await createChat();
        console.log("Creating new chat...");

        if (!chatIdToUse) {
          console.error("Failed to create a new chat.");
          return;
        }
      }

      const { data, error } = await supabase.from("messages").insert({
        message: input,
        assistant: false,
        conversation: chatIdToUse,
      });

      if (error) {
        console.error("Error inserting message:", error);
        return;
      }

      handleSubmit(
        {},
        {
          headers: { Authorization: `Bearer ${await getAccessToken()}` },
          data: { conversationId: chatIdToUse, model: selectedModel },
        }
      );
    };

    insert();
  }

  const createChat = async (): Promise<string> => {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("conversations")
      .insert({ name: "New Chat", user: userData?.user?.id })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      throw new Error("Failed to create chat.", error);
    }

    if (data) {
      setChatId(data.id);
      console.log("New chat created with ID:", data.id);
    } else {
      console.error("No chat data returned after creation.");
    }

    return data.id;
  };

  const loadChat = async () => {
    let chatIdToUse = currentChatId;

    if (!chatIdToUse) {
      console.error("No chat ID provided to load messages.");
      chatIdToUse = await createChat();
      setChatId(chatIdToUse);

      if (!chatIdToUse) {
        console.error("Failed to create a new chat.");
        return;
      }
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation", chatIdToUse)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading chat messages:", error);
      return;
    }

    if (data) {
      setChatId(chatIdToUse);
      setMessages(
        data.map((message) => ({
          id: message.id.toString(),
          role: message.assistant ? "assistant" : "user",
          content: message.message ?? "",
        }))
      );
      console.log("Chat messages loaded:", data);
    }
  };

  useEffect(() => {
    if (chatId) {
      setChatId(chatId);
      console.log("Using existing chat ID:", chatId);
      loadChat();
      return;
    }
  }, [chatId]);

  return (
    <div className={`flex h-full w-full`}>
      <div className={`flex flex-col grow justify-between h-full`}>
        {messages.length < 1 && (
          <div className={`flex justify-center items-center grow`}>
            <Heading className={`text-3xl`}>How can I help you,&nbsp;</Heading>
            <UserFullName className="text-3xl font-bold"/>
            <h1 className="text-3xl font-bold">!</h1>
          </div>
        )}

        {messages.length > 0 && (
          <div
            className={`flex flex-col mt-16 items-center gap-8 grow max-h-[80vh] py-12 overflow-y-auto`}
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
