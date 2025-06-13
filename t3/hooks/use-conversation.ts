"use client";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { useCurrentUser } from "./use-current-user";
import { useSidebar } from "@/components/ui/sidebar";
import { Tables } from "@/database.types";
import { Message, UIMessage } from "ai";

export function useConversation(chatIdProp?: string | null) {
  const [chat, setChat] = useState<Tables<"conversations"> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const user = useCurrentUser();
  const sidebar = useSidebar();

  const createChat = useCallback(async () => {
    if (user.isLoading || !user.user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ name: "New Chat", user: user?.user?.id })
      .select()
      .single();

    sidebar.setTitle("New Chat");

    if (error) {
      console.error("Error creating chat:", error);
      throw new Error("Failed to create chat.", error);
    }

    if (data) {
      setChat(data);
      console.log("New chat created with ID:", data.id);
    } else {
      console.error("No chat data returned after creation.");
    }

    return data;
  }, [user]);

  const loadChat = useCallback(
    async (chatId: string) => {
      let chatIdToUse = chatId;

      if (!chatIdToUse) {
        throw new Error("Invalid chat");
      }

      const conversation = await supabase
        .from("conversations")
        .select("*")
        .eq("id", chatIdToUse)
        .single();

      if (conversation.error) {
        console.error("Error fetching conversation:", conversation.error);
        return;
      }

      if (!conversation.data) {
        console.error("No conversation data found for ID:", chatIdToUse);
        return;
      }

      setChat(conversation.data);
      sidebar.setTitle(conversation.data.name || "New Chat");

      console.log("Chat loaded:", conversation.data);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation", chatIdToUse)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading chat messages:", error);
        throw new Error("Failed to load chat messages.", error);
      }

      if (data) {
        console.log(data);
        setMessages(
          data.map((msg) => ({
            id: msg.id.toString(),
            role: msg.assistant ? "assistant" : "user",
            content: msg.message ?? "",
            parts: [{ type: "text", text: msg.message ?? "" }],
          }))
        );

        return [];
      }

      throw new Error("No messages found for the chat.");
    },
    [createChat, sidebar]
  );

  const subscribeToNameChanges = useCallback(
    (chatId: string) => {
      const channel = supabase
        .channel(`conversation-name-${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversations",
            filter: `id=eq.${chatId}`,
          },
          (payload) => {
            sidebar.setTitle(
              (payload.new as Tables<"conversations">).name ?? "New Chat"
            );
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    },
    [sidebar]
  );

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    async function init() {
      setLoading(true);
      console.log("loading conversation");
      
      try {
        // if they passed in an ID, load that, otherwise, only create once if we don't already have a chat
        let convo: string | undefined;
        if (chatIdProp === "new" || !chatIdProp) {
          convo = (await createChat())?.id;

          if (!convo) {
            console.warn(
              "User was not logged in and attempted to create chat."
            );
            return;
          }
          cleanupFn = subscribeToNameChanges(convo);
        } else {
          await loadChat(chatIdProp);
        }

        // subscribe once for name‐changes
      } catch (err) {
        console.error("Conversation init error:", err);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [chatIdProp]);

  return {
    chat,
    messages,
    loading,
    createChat,
    loadChat,
  };
}
