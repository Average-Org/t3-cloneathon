"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ConversationProvider } from "../../../lib/conversation-context";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ConversationProvider>
        <AppSidebar>{children}</AppSidebar>
      </ConversationProvider>
    </SidebarProvider>
  );
}
