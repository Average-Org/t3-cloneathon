"use client";

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
import {LogInIcon, SearchIcon} from "lucide-react";
import {useState} from "react";

export function AppSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    function toggleSidebar() {
        setSidebarOpen(!sidebarOpen);
    }

    return (
        <>
            <Sidebar>
                <SidebarHeader className={`relative flex items-center pt-4 justify-center h-12`}>
                    <SidebarTrigger onClick={toggleSidebar} className={`absolute left-5`}/>
                    <Heading className={`text-center`}>
                        T3.chat
                    </Heading>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className={`flex flex-col items-center gap-3`}>
                        <Button className={`font-bold w-[90%] cursor-pointer`}>
                            New Chat
                        </Button>

                        <Input placeholder={`Search your threads...`}
                               icon={<SearchIcon className={`w-4 h-4 text-muted-foreground`}/>}
                               className={`w-[90%] `}
                               inputClassName={`border-0 !bg-transparent !rounded-b-none !border-b-2 focus:!ring-0`}>
                        </Input>
                    </SidebarGroup>
                    <SidebarGroup/>
                </SidebarContent>
                <SidebarFooter>
                    <Button
                        className={`!bg-transparent cursor-pointer text-muted-foreground !px-4 !py-10 text-md transition-all hover:!bg-muted-foreground/30 justify-start hover:text-foreground w-full`}>
                        <div className={`flex gap-3 items-center`}>
                            <LogInIcon/>
                            Login
                        </div>
                    </Button>
                </SidebarFooter>
            </Sidebar>
            
            {!sidebarOpen && (
                <div className={`p-1 bg-accent h-fit rounded-xl m-2`}>
                    <SidebarTrigger onClick={toggleSidebar} />
                </div>
            )}
        </>
    );
}