import { createClient } from "@/lib/server";
import SettingsPage from "./settings";

export default async function SettingsServerPage() {

    const supabase = await createClient();
    const { data: userSettings } = await supabase
        .from("usersettings")
        .select("*")
        .limit(1)
        .single();

    if(!userSettings){
        throw new Error("User settings not found");
    }

    return (
        <SettingsPage userSettings={userSettings} />
    )
}