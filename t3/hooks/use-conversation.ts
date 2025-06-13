// /stores/conversationStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/database.types";
import type { Message as AIMessage } from "ai";

type Conversation = Tables<"conversations">;

interface ConversationStore {
  chat: Conversation | null;
  messages: Tables<"messages">[];
  loading: boolean;

  // actions
  createChat: () => Promise<Conversation | null>;
  loadChat: (chatId: string) => Promise<void>;
  init: (chatIdProp?: string | null) => Promise<void>;
  setMessages: (messages: Tables<"messages">[]) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  chat: null,
  messages: [],
  loading: false,

  setMessages: (messages: Tables<"messages">[]) => {
    set({ messages: messages });
  },

  createChat: async () => {
    // grab current user directly from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ name: "New Chat", user: user.id })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return null;
    }

    if (!data) {
      console.error("Could not get a response after creating chat.");
      return null;
    }

    set({ chat: data });
    return data;
  },

  loadChat: async (chatId) => {
    console.log("Attempting to load chat:", chatId);
    const { data: convo, error: convoErr } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", chatId)
      .single();

    console.log("Chat loaded: ", convo);

    if (convoErr || !convo) {
      console.error("Error fetching conversation:", convoErr);
      return;
    }
    set({ chat: convo });

    const { data: msgs, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation", chatId)
      .order("created_at", { ascending: true });

    if (msgErr) {
      console.error("Error loading chat messages:", msgErr);
      return;
    }

    set({ messages: msgs });
  },

  init: async (chatIdProp) => {
    set({ chat: null })
    set({ messages: [] });
    set({ loading: true });
    try {
      if (chatIdProp === "new" || !chatIdProp) {
        const newConvo = await get().createChat();
        if (!newConvo) throw new Error("Could not create chat");
      } else {
        await get().loadChat(chatIdProp);
      }
    } catch (err) {
      console.error("Conversation init error:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
