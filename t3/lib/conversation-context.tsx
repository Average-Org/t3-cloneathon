"use client";
import React, { createContext, useContext } from "react";
import { useConversation } from "@/hooks/use-conversation";
import { useParams } from "next/navigation";

type ConversationState = ReturnType<typeof useConversation>;

const ConversationCtx = createContext<ConversationState | null>(null);

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {id} = useParams<{id: string}>();
  const conversation = useConversation(id);
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