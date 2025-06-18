// /stores/conversationStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/database.types";
import type { Message as AIMessage } from "ai";

type Conversation = Tables<"conversations">;

interface ConversationStore {
  chat: Conversation | null;
  activeId: string | null;
  setChat: (chat: Tables<"conversations">) => void;
  updateCurrentChatName: (name: string) => void;
  setActiveId: (id: string | null) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  chat: null,
  activeId: null,
  setActiveId: (id: string | null) => {
    set({activeId:id})
  },
  setChat: (chat: Tables<"conversations">) => {
      set({chat: chat})
  },
  updateCurrentChatName: (name: string) => {
    const currentChat = get().chat;
    if (currentChat) {
      set({
        chat: {
          created_at: currentChat.created_at,
          id: currentChat.id,
          name: name,
          user: currentChat.user,
        }
      });
    }
  }
}));
