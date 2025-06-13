"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { LogInIcon, SearchIcon } from "lucide-react";
import * as React from "react";
import { useEffect, useState, startTransition } from "react";
import { supabase } from "@/lib/supabaseClient";
import UserProfilePicture from "./ProfilePicture";
import UserFullName from "./Username";
import { useTheme } from "next-themes";
import {
  MoonIcon,
  PencilSquareIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import AdjustmentsHorizontalIcon from "@heroicons/react/24/outline/AdjustmentsHorizontalIcon";
import { Tables } from "@/database.types";
import { ConversationItem } from "./sidebar/conversation-item";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useConversationCtx } from "@/lib/conversation-context";

export interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  componentProps?: React.ComponentProps<"div">;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, changeSidebarState] = useState(true);
  const [conversations, setConversations] = useState<
    { id: string; name: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const conversation = useConversationCtx();
  const user = useCurrentUser();

  useEffect(() => {
    if (!user.user?.id) return;

    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user=eq.${user.user?.id}`,
        },
        (payload) => {
          setConversations((prev) => {
            const newRow = payload.new as Tables<"conversations">;
            const oldRow = payload.old as Tables<"conversations">;

            // Helper to normalize conversation object
            const normalize = (row: any) => ({
              id: row.id,
              name: row.name ?? "Untitled Chat",
            });

            if (payload.eventType === "DELETE") {
              return prev.filter((conv) => conv.id !== oldRow.id);
            } else if (payload.eventType === "INSERT") {
              return [normalize(newRow), ...prev];
            } else if (payload.eventType === "UPDATE") {
              return prev.map((conv) =>
                conv.id === newRow.id ? normalize(newRow) : conv
              );
            }
            return prev;
          });
        }
      )
      .subscribe();

    console.log("Subscribed to conversation changes.");

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user.user?.id]);

  useEffect(() => {
    const getConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,name")
        .order("created_at", { ascending: false });

      if (!data) throw new Error("Conversation data could not be retrieved.");

      setConversations(data);
      setLoading(false);
    };

    const initialize = async () => {
      await getConversations();
    };

    initialize();
  }, []);

  useEffect(() => {
    router.prefetch("/chat/new");
  }, []);

  function toggleSidebar() {
    changeSidebarState((prev) => !prev);
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  const router = useRouter();

  const newChat = React.useCallback(() => {
    startTransition(() => router.push("/chat/new"));
  }, [router]);

  const goToChat = React.useCallback(
    (id: string) => {
      startTransition(() => router.push(`/chat/${id}`));
    },
    [router]
  );

  return (
    <div className={`flex flex-row w-full`}>
      <Sidebar className={`!border-r-0`}>
        <SidebarHeader
          className={`relative flex items-center pt-4 justify-center h-12`}
        >
          <SidebarTrigger
            onClick={toggleSidebar}
            className={`absolute left-5`}
          />
          <Heading className={`text-center`}>T3.chat</Heading>
        </SidebarHeader>
        <SidebarContent className={`overflow-x-hidden`}>
          <SidebarGroup className={`flex flex-col items-center gap-3 `}>
            <Button
              onClick={newChat}
              className="font-bold w-[90%] cursor-pointer relative flex items-center justify-center"
            >
              <span>New Chat</span>
              <PencilSquareIcon className="w-5 h-5 absolute right-4" />
            </Button>

            <Input
              placeholder={`Search your threads...`}
              icon={<SearchIcon className={`w-4 h-4 text-muted-foreground`} />}
              className={`w-[90%] `}
              inputClassName={`border-0 !bg-transparent !rounded-b-none !border-b-2 focus:!ring-0`}
            ></Input>
          </SidebarGroup>
          <SidebarGroup>
            {!loading &&
              conversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  id={c.id}
                  name={c.name ?? "Untitled Chat"}
                  active={conversation.chat?.id === c.id}
                  onClick={goToChat}
                />
              ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {!user.user && (
            <Button
              className={`!bg-transparent cursor-pointer text-muted-foreground !px-4 !py-10 text-md transition-all hover:!bg-muted-foreground/30 justify-start hover:text-foreground w-full`}
              onClick={() => router.push("/login")}
            >
              <div className={`flex gap-3 items-center`}>
                <LogInIcon />
                Login
              </div>
            </Button>
          )}
          {user.user && (
            <div className="flex items-center gap-3 bg-background/50 p-3 rounded-xl">
              <div className="w-10 h-10 flex justify-center items-center rounded-full overflow-hidden">
                <UserProfilePicture />
              </div>
              <div className="flex flex-col">
                <div className="text-sm text-foreground font-medium">
                  <UserFullName />
                </div>
                <span className="text-xs text-muted-foreground">Free</span>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <div className={`content-wrapper flex flex-col grow`}>
        {!isSidebarOpen && (
          <div className={`absolute p-2 bg-accent h-fit rounded-xl mt-4 ml-3`}>
            <SidebarTrigger onClick={toggleSidebar} />
          </div>
        )}

        {!isSidebarOpen && (
          <div className={`bg-background grow border`}>
            <div
              className={`flex items-center w-full p-5 ${
                conversation.chat?.name ? "border-b" : ""
              }`}
            >
              <Heading
                className={`text-foreground/75 text-3xl ml-12 ${
                  !conversation.chat?.name ? "opacity-0" : ""
                }`}
              >
                {conversation.chat?.name || "Placeholder"}
              </Heading>
            </div>
            {children}
          </div>
        )}

        {isSidebarOpen && (
          <div className={`grow shrink-0 flex flex-col bg-sidebar`}>
            <div
              className={`relative bg-sidebar pb-4 flex w-full place-content-end-safe overflow-visible`}
            >
              <div
                className={`icons justify-center absolute -bottom-8 right-0 p-1 pb-2 flex gap-2 pl-4 bg-sidebar rounded-bl-[3rem] border-b-1 border-l-0`}
              >
                <Button
                  variant={"ghost"}
                  className={`rounded-3xl`}
                  onClick={toggleTheme}
                >
                  {theme === "light" ? (
                    <MoonIcon className="size-6" />
                  ) : (
                    <SunIcon className="size-6" />
                  )}
                </Button>

                <Button variant={"ghost"} className={`rounded-3xl`}>
                  <AdjustmentsHorizontalIcon className={`size-6`} />
                </Button>
              </div>
            </div>

            <div className={`bg-background grow rounded-tl-xl border`}>
              <div
                className={`flex items-center w-full p-3 ${
                  conversation.chat?.name ? "border-b" : ""
                }`}
              >
                <Heading
                  className={`text-foreground/75 text-3xl ml-4 ${
                    !conversation.chat?.name ? "opacity-0" : ""
                  }`}
                >
                  {conversation.chat?.name || "Placeholder"}
                </Heading>
              </div>
              {children}
            </div>
          </div>
        )}

        {!isSidebarOpen && (
          <div
            className={`absolute right-0 p-1 bg-accent h-fit rounded-xl mt-4 mr-3`}
          >
            <Button
              variant={"ghost"}
              className={`rounded-3xl`}
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <MoonIcon className="size-6" />
              ) : (
                <SunIcon className="size-6" />
              )}
            </Button>

            <Button variant={"ghost"} className={`rounded-3xl`}>
              <AdjustmentsHorizontalIcon className={`size-6`} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
