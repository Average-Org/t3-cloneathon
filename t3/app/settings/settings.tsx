"use client";
import { UserSettings, useUserSettingsStore } from "@/hooks/user-settings-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SettingsPageProps {
    userSettings?: UserSettings;
}

export default function SettingsPage({ userSettings }: SettingsPageProps) {
    const userSettingsState = useUserSettingsStore((state) => state.userSettings);
    const setUserSettings = useUserSettingsStore((state) => state.setUserSettings);
    const syncUserSettings = useUserSettingsStore((state) => state.syncUserSettings);

    const [name, setName] = useState(userSettings?.name || "");
    const [profession, setProfession] = useState(userSettings?.job || "");
    const [traits, setTraits] = useState(
        Array.isArray(userSettings?.traits) ? userSettings?.traits.join(', ') : ""
    );
    const [additionalInfo, setAdditionalInfo] = useState(userSettings?.additional_info || "");

    const defaultTraits = [
        "friendly", "witty", "concise", "curious", 
        "empathetic", "creative", "patient"
    ];

    useEffect(() => {
        if (userSettings) {
            setUserSettings(userSettings);
        }
    }, [userSettings, setUserSettings]);

    const handleTraitToggle = (trait: string) => {
        const currentTraits = traits.split(',').map(t => t.trim()).filter(t => t);
        if (currentTraits.includes(trait)) {
            setTraits(currentTraits.filter(t => t !== trait).join(', '));
        } else {
            setTraits([...currentTraits, trait].join(', '));
        }
    };

    const handleSavePreferences = () => {
        setUserSettings({
            name,
            job: profession,
            traits: traits.split(',').map(t => t.trim()).filter(t => t),
            user_id: userSettingsState?.user_id || "",
            additional_info: additionalInfo || "",
            id: userSettingsState?.id || ""
        })

        
        syncUserSettings();
    };

    return (
        <div className="max-w-2xl space-y-8 flex justify-normal pt-8 bg-sidebar rounded-2xl p-4">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        What should RJ3 Chat call you?
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={50}
                    />
                    <div className="text-right text-muted-foreground text-xs mt-1">0/50</div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        What do you do?
                    </label>
                    <Input
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="Engineer, student, etc."
                        maxLength={100}
                    />
                    <div className="text-right text-xs text-muted-foreground mt-1">0/100</div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        What traits should RJ3 Chat have? 
                        <span className="text-muted-foreground text-sm"> (up to 50, max 100 chars each)</span>
                    </label>
                    <Input
                        value={traits}
                        onChange={(e) => setTraits(e.target.value)}
                        placeholder="Type a trait and press Enter or Tab..."
                    />
                    <div className="text-right text-muted-foreground text-xs mb-3">0/50</div>
                    
                    <div className="flex flex-wrap gap-2">
                        {defaultTraits.map((trait) => (
                            <Button
                                key={trait}
                                variant={traits.includes(trait) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleTraitToggle(trait)}
                                className="text-sm"
                            >
                                {trait} +
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Anything else RJ3 Chat should know about you?
                    </label>
                    <Textarea
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Interests, values, or preferences to keep in mind"
                        maxLength={3000}
                    />
                    <div className="text-right text-xs text-muted-foreground mt-1">0/3000</div>
                </div>

                <div className="flex gap-4">
                    <Button 
                        onClick={handleSavePreferences}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Save Preferences
                    </Button>
                </div>
            </div>

        </div>
    );
}