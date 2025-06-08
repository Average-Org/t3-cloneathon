"use client";

import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {useState} from "react";
import {Heading} from "@/components/heading";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {ArrowUpIcon, SparklesIcon} from "@heroicons/react/24/outline";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {SelectIcon} from "@radix-ui/react-select";
import {BotIcon, CloudLightningIcon} from "lucide-react";

export default function HomeClient() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (<>
        <SidebarProvider>
            <AppSidebar isSidebarOpen={sidebarOpen} changeSidebarState={setSidebarOpen}>
                <div className={`flex flex-col grow justify-between h-full `}>
                    <div className={`flex justify-center items-center grow`}>
                        <Heading className={`text-3xl`}>
                            How can I help you?
                        </Heading>
                    </div>


                    <div className={`flex justify-center items-center`}>
                        <div className={`w-[50%]`}>
                            <div className={`relative`}>
                                <Textarea className={`h-28 p-5 border-b-0 rounded-b-none resize-none`}
                                          placeholder={`Type your message here...`}>

                                </Textarea>
                                <Button variant={"outline"}
                                        className={`absolute bottom-2 right-3 rounded-3xl !px-[0.75rem]`}>
                                    <ArrowUpIcon/>
                                </Button>

                                <div className={`absolute bottom-2 left-3`}>
                                    <Select>
                                        <SelectTrigger>
                                            <BotIcon />
                                            <SelectValue placeholder={"Automatic"} />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value={`gpt-4o`}>
                                                GPT 4o
                                            </SelectItem>

                                            <SelectItem value={`claude-3.7-sonnet`}>
                                                Claude 3.7 Sonnet
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppSidebar>
        </SidebarProvider>
    </>)
        ;
}