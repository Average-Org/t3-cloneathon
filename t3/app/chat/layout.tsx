import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ConversationProvider } from "@/lib/conversation-context";

export default function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id?: string };
}) {
  return (
    <SidebarProvider>
      <ConversationProvider chatId={params.id}>
        <AppSidebar>{children}</AppSidebar>
      </ConversationProvider>
    </SidebarProvider>
  );
}
