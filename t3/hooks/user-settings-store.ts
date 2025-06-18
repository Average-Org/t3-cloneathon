import { Tables } from "@/database.types";
import { supabase } from "@/lib/supabaseClient";
import { create } from "zustand";

export type UserSettings = Tables<"usersettings">;

export interface UserSettingsStore {
    userSettings: UserSettings | null;
    setUserSettings: (userSettings: UserSettings) => void;
    syncUserSettings: () => void;
}

export const useUserSettingsStore = create<UserSettingsStore>((set, get) => ({
    userSettings: null,
    setUserSettings: (userSettings: UserSettings) => {
        set({userSettings: userSettings});
    },
    syncUserSettings: async () => {
        // update database with current user settings
        const { userSettings } = get();

        if (!userSettings || !userSettings.user_id) return;

        const { error } = await supabase
            .from("usersettings")
            .update(userSettings)
            .eq("user_id", userSettings.user_id);

        if (error) {
            console.error("Failed to sync user settings:", error);
        }

        set({ userSettings });
    },
}));