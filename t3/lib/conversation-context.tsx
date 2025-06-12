"use client";
import React, { createContext, useContext } from "react";
import { useConversation } from "@/hooks/use-conversation";

type ConversationState = ReturnType<typeof useConversation>;

const ConversationCtx = createContext<ConversationState | null>(null);

export function ConversationProvider({
  chatId,
  children,
}: {
  chatId?: string | null;
  children: React.ReactNode;
}) {
  const conversation = useConversation(chatId);
  return (
    <ConversationCtx.Provider value={conversation}>
      {children}
    </ConversationCtx.Provider>
  );
}

export function useConversationCtx() {
  const ctx = useContext(ConversationCtx);
  if (!ctx) throw new Error("useConversationCtx must be used inside ConversationProvider");
  return ctx;
}