import HomeClient from "@/app/home-client";
import { Tables } from "@/database.types";
import { UserSettings } from "@/hooks/user-settings-store";
import { getSupabase, getSupabaseUser } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  let chat: Tables<"conversations"> | null = null;
  const supabase = await getSupabase();
  const user = await getSupabaseUser();

  let shouldReplaceUrl = false;

  if (!user.data.user) {
    redirect("/login");
  }

  if (id === "new") {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ name: "New Chat", user: user.data.user.id })
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create conversation");
    }

    chat = data;
    shouldReplaceUrl = true;
  } else {
    // Single query to get conversation with user authorization check
    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .select()
      .eq("id", id)
      .eq("user", user.data.user.id) // Security: ensure user owns the conversation
      .maybeSingle();

    if (conversationError) {
      console.error("Failed to retrieve conversation:", conversationError);
      redirect("/chat/new");
    }

    chat = conversationData;
  }

  if (!chat) {
    redirect("/chat/new");
  }

  // Get messages for the chat in a separate optimized query
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, message, assistant, created_at, attachments, sources, reasoning")
    .eq("conversation", chat.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Failed to retrieve messages:", messagesError);
    // Don't redirect, just pass empty messages array
  }

  let userSettingsData: Tables<"usersettings">[] | null = null;
  // fetch user settings
  const { data: initialSettings, error: userSettingsError } = await supabase
  .from("usersettings")
  .select()
  .eq("user_id", user.data.user.id)
  .limit(1);


  if (userSettingsError || !initialSettings || initialSettings.length === 0) {
    const { data: insertedUserSettingsData, error: insertedErrorUserSettings } =
      await supabase
        .from("usersettings")
        .insert({
          name: "",
          job: "Assistant",
          traits: [],
          user_id: user.data.user.id,
        })
        .single();

    if (insertedErrorUserSettings) {
      if (userSettingsError) {
        console.error(userSettingsError);
      }
      console.error(insertedErrorUserSettings);
      throw new Error("There was an error inserting user settings");
    }

    userSettingsData = insertedUserSettingsData;
  }

  if (!userSettingsData) {
    console.error("User settings data is null or undefined");
    throw new Error("User settings not found");
  }

  // get messages for the chat
  return (
    <HomeClient
      chat={chat}
      shouldReplaceUrl={shouldReplaceUrl}
      userSettings={userSettingsData[0] as UserSettings}
      messages={(messages || []) as Tables<"messages">[]}
    />
  );
}
