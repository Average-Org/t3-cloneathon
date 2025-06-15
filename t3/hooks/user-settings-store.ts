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
    },
}));