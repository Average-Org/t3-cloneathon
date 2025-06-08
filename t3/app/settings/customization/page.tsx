// app/settings/customization/page.tsx
'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CustomizationPage() {
  const [userName, setUserName] = useState('');
  const [userOccupation, setUserOccupation] = useState('');
  const [userTraits, setUserTraits] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState('');

  const handleTraitAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      const input = e.target as HTMLInputElement;
      const trait = input.value.trim();
      if (trait && !userTraits.includes(trait)) {
        setUserTraits([...userTraits, trait]);
        input.value = '';
      }
      e.preventDefault();
    }
  };

  const handleTraitRemove = (traitToRemove: string) => {
    setUserTraits(userTraits.filter(trait => trait !== traitToRemove));
  };

  const handleSaveChanges = () => {
    // Here you would typically send this data to your Supabase database
    console.log("Saving changes:", {
      userName,
      userOccupation,
      userTraits,
      userInterests,
    });
    // Implement Supabase update logic here
  };

  return (
    <div className="max-w-3xl"> {/* This div defines the width of the form content itself */}
      <h3 className="text-xl font-semibold mb-6">Customize T3 Chat</h3>

      {/* What should T3 Chat call you? */}
      <div className="mb-6">
        <Label htmlFor="userName" className="text-foreground mb-2 block">
          What should T3 Chat call you?
        </Label>
        <Input
          id="userName"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          maxLength={50}
          className="bg-secondary border-input text-foreground"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{userName.length}/50</p>
      </div>

      {/* What do you do? */}
      <div className="mb-6">
        <Label htmlFor="userOccupation" className="text-foreground mb-2 block">
          What do you do?
        </Label>
        <Input
          id="userOccupation"
          placeholder="Engineer, student, etc."
          value={userOccupation}
          onChange={(e) => setUserOccupation(e.target.value)}
          maxLength={100}
          className="bg-secondary border-input text-foreground"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{userOccupation.length}/100</p>
      </div>

      {/* What traits should T3 Chat have? */}
      <div className="mb-6">
        <Label htmlFor="userTraits" className="text-foreground mb-2 block">
          What traits should T3 Chat have?
          <span className="text-muted-foreground ml-2">(up to 50, max 100 chars each)</span>
        </Label>
        <Input
          id="userTraits"
          placeholder="Type a trait and press Enter or Tab..."
          onKeyDown={handleTraitAdd}
          className="bg-secondary border-input text-foreground"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {userTraits.map((trait, index) => (
            <span
              key={index}
              className="bg-secondary text-foreground px-3 py-1 rounded-full text-sm flex items-center"
            >
              {trait}
              <button
                onClick={() => handleTraitRemove(trait)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-right mt-1">{userTraits.length}/50</p>
      </div>

      {/* Anything else T3 Chat should know about you? */}
      <div className="mb-6">
        <Label htmlFor="userInterests" className="text-foreground mb-2 block">
          Anything else T3 Chat should know about you?
        </Label>
        <Textarea
          id="userInterests"
          placeholder="Interests, values, or preferences to keep in mind"
          value={userInterests}
          onChange={(e) => setUserInterests(e.target.value)}
          maxLength={3000}
          rows={6}
          className="bg-secondary border-input text-foreground resize-y min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{userInterests.length}/3000</p>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSaveChanges}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}