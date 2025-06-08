import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader, SidebarTrigger,
} from "@/components/ui/sidebar";
import {Heading} from "@/components/heading";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarHeader className={`relative flex items-center pt-4 justify-center h-12`}>
            <SidebarTrigger className={`absolute left-5`} />
            <Heading className={`text-center`}>
                T3.chat
            </Heading>
        </SidebarHeader>
          <SidebarContent>
              <SidebarGroup className={`flex flex-col justify-center`}>
                  <Button className={`font-bold w-[90%]`}>
                      New Chat
                  </Button>

                  <Input className={`w-`}>

                  </Input>
              </SidebarGroup>
              <SidebarGroup />
          </SidebarContent>
          <SidebarFooter />
      </Sidebar>
    );
}