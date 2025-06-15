"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
  SelectLabel,

} from "@/components/ui/select";
import { AlertCircleIcon, BotIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabaseClient";
import UserFullName from "@/components/Username";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { stateMessageToAiMessage } from "@/utils/stateMessageToAiMessage";
import { Message } from "@/components/message";
import { Tables } from "@/database.types";
import { useConversationStore } from "@/hooks/use-conversation";
import { UserSettings, useUserSettingsStore } from "@/hooks/user-settings-store";
import { getModelSearchDefinition } from "@/lib/model-search-awareness";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";
interface HomeClientProps {
  chat: Tables<"conversations"> | null;
  messages: Tables<"messages">[];
  shouldReplaceUrl: boolean;
  userSettings: UserSettings;
}

export default function HomeClient({
  chat,
  messages,
  shouldReplaceUrl,
  userSettings
}: HomeClientProps) {
  const [useSearch, setSearch] = useState(false);

  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const setChat = useConversationStore((state) => state.setChat);
  const setUserSettings = useUserSettingsStore((state) => state.setUserSettings);
  const userSettingsState = useUserSettingsStore((state) => state.userSettings);
  const {
    messages: aiMessages,
    setMessages: setAiMessages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    isLoading,
    stop,
  } = useChat({
    api: "/api/chat",
    credentials: "include",
    initialMessages: messages.map(stateMessageToAiMessage),
  });

  function canSearch(modelName: string) {
    return getModelSearchDefinition(modelName).canDoWebSearch;
  }

  const router = useRouter();
  const user = useCurrentUser();
  const hasInitialized = useRef(false);
  const scrollView = useRef<HTMLDivElement>(null);

  function handleKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.code === "Enter" && !event.shiftKey) {
      event.preventDefault();
      insertMessage();
    }
  }

  useEffect(() => {
    // runs every time the array in the store changes
    if (shouldReplaceUrl) {
      router.replace(`/chat/${chat?.id}`);
    }
    setChat(chat as Tables<"conversations">);
    shouldReplaceUrl = false;
  }, [shouldReplaceUrl, chat, messages, setAiMessages, setChat, router]);

  useEffect(() => {
    if (scrollView.current) {
      scrollView.current.scrollTop = scrollView.current.scrollHeight;
    }
  }, [aiMessages]);

  useEffect(() => {
        setUserSettings(userSettings);
  }, [userSettings])

  const insertMessage = useCallback(async () => {
    if (input.trim() === "" || input.length < 1) {
      console.warn("Input is empty, not inserting message.");
      return;
    }

    if (!chat?.id || !chat) {
      return;
    }

    console.log("Inserting message:", input);

    handleSubmit(
      {},
      {
        data: {
          conversationId: chat.id,
          model: selectedModel,
          search: useSearch,
        },
      }
    );

    const { error } = await supabase.from("messages").insert({
      message: input,
      assistant: false,
      conversation: chat?.id,
    });

    console.log("Message inserted:", chat?.id);
    if (error) {
      console.error("Error inserting message:", error);
      return;
    }
  }, [chat?.id, input, handleSubmit, selectedModel, useSearch]);

  return (
    <div className={`flex h-full w-full flex-col max-h-[calc(100vh-5rem)]`}>
      <div className={`flex flex-col grow justify-between h-full`}>
        <div
          ref={scrollView}
          className={`flex flex-col items-center gap-8 grow max-h-[80vh] py-12 overflow-y-auto transition-all duration-500 scroll-smooth`}
        >
          {error && (
            <div className={`flex justify-center items-center max-w-[80%]`}>
              <Alert variant={"destructive"} className={`shrink`}>
                <AlertCircleIcon />
                <AlertTitle>{error.message}</AlertTitle>
                <AlertDescription className={`wrap-normal`}>
                  <p>
                    {error.stack?.toString() || "An unexpected error occurred."}
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!aiMessages.length && !isLoading && (
            <div
              className={`flex justify-center items-center justify-items-center grow`}
            >
              <Heading className={`text-3xl`}>
                How can I help you,&nbsp;
              </Heading>
              <UserFullName className="text-3xl font-bold" />
              <h1 className="text-3xl font-bold">!</h1>
            </div>
          )}

          {aiMessages.map((message) => (
            <Message message={message} key={message.id} />
          ))}
        </div>

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
                  onClick={insertMessage}
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
                    <SelectGroup>
                      <SelectLabel className="text-sm py-1 pl-1 text-muted-foreground select-none">
                        OpenAI
                      </SelectLabel>
                      <SelectItem value={`gpt-4.1`}>GPT 4.1</SelectItem>
                      <SelectItem value={`gpt-4.1-mini`}>GPT 4.1 mini</SelectItem>
                      <SelectItem value={`gpt-4.1-nano`}>GPT 4.1 nano</SelectItem>
                      <SelectItem value={`o3-mini`}>GPT o3 mini</SelectItem>
                      <SelectItem value={`o4-mini`}>GPT o4 mini</SelectItem>

                      <SelectItem value={`gpt-4o`}>GPT 4o</SelectItem>
                      <SelectItem value={`gpt-4o-mini`}>GPT 4o mini</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="text-sm py-1 pl-1 text-muted-foreground select-none">
                        Anthropic
                      </SelectLabel>
                      <SelectItem value={`claude-sonnet-4-20250514`}>
                        Claude Sonnet 4
                      </SelectItem>
                      <SelectItem value={`claude-opus-4-20250514`}>
                        Claude Opus 4
                      </SelectItem>
                      <SelectItem value={`claude-3-7-sonnet-latest`}>
                        Claude 3.7 Sonnet
                      </SelectItem>
                      <SelectItem value={`claude-3-5-sonnet-latest`}>
                        Claude 3.5 Sonnet
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {canSearch(selectedModel) && (
                  <>
                    <Button
                      onClick={() => setSearch(!useSearch)}
                      variant={"outline"}
                      className={`rounded-3xl !px-[0.75rem] hover:scale-105 ${
                        useSearch
                          ? "!text-accent-foreground !bg-blue-500/80"
                          : ""
                      }`}
                      style={{
                        transition:
                          "background-color 400ms ease-in-out, color 400ms ease-in-out, scale 200ms ease-in-out",
                      }}
                    >
                      <GlobeAltIcon />
                      Search
                    </Button>
                  </>
                )}

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
