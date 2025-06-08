"use client";

import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {useState} from "react";

export default function HomeClient() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (<>
        <SidebarProvider>
            <AppSidebar value={sidebarOpen} onChange={setSidebarOpen}>
                <main className={`w-full h-full`}>

                </main>
            </AppSidebar>
        </SidebarProvider>
    </>);
}