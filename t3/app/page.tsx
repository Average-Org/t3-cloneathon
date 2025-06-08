import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";

export default function Home() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main>

        </main>
      </SidebarProvider>
    </>
  );
}
