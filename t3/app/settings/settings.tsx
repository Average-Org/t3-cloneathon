"use client";
import { UserSettings, useUserSettingsStore } from "@/hooks/user-settings-store";
import { useEffect } from "react";

interface SettingsPageProps {
    userSettings?: UserSettings;
}

export default function SettingsPage({ userSettings }: SettingsPageProps) {
    const userSettingsState = useUserSettingsStore((state) => state.userSettings);
    const setUserSettings = useUserSettingsStore((state) => state.setUserSettings);

    useEffect(() => {
        if (userSettings) {
            setUserSettings(userSettings);
        }
    }, [userSettings, setUserSettings]);

    return (
        <div>
            {/* Render your settings UI here */}
            <pre>{JSON.stringify(userSettingsState, null, 2)}</pre>
        </div>
    );
}