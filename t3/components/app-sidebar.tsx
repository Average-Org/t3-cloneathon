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
import * as React from "react";

export interface AppSidebarProps  extends React.PropsWithChildren {
    componentProps?: React.ComponentProps<"div">;
    value: boolean;
    onChange: (value: boolean) => void;
}

export function AppSidebar({value, onChange, componentProps}: AppSidebarProps) {

    function toggleSidebar() {
        onChange(!value);
    }

    return (
        <div className={`flex flex-row`}>
            <Sidebar className={``}>
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

            <div className={`content-wrapper`}>
                {!value && (
                    <div className={`p-1 bg-accent h-fit rounded-xl m-2`}>
                        <SidebarTrigger onClick={toggleSidebar}/>
                    </div>
                )}
            </div>



            {componentProps && (
                <div {...componentProps} className={`h-fit p-2 bg-sidebar grow shrink-0`}>
                    <div>
                        Hi
                    </div>
                    {componentProps.children}
                </div>
            )}
        </div>
    );
}