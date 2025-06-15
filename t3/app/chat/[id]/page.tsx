import HomeClient from "@/app/home-client";
import { Tables } from "@/database.types";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

type PageProps = {
  params: { id: string };
};

export default async function ChatRoute({ params }: PageProps) {
  let chat: Tables<"conversations"> | null = null;
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const { id } = await params;
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
    console.log("Retrieving chat with ID:", id);
    
    // Single query to get conversation with user authorization check
    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .select()
      .eq("id", id)
      .eq("user", user.data.user.id) // Security: ensure user owns the conversation
      .single();

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
    .select("id, message, assistant, created_at")
    .eq("conversation", chat.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Failed to retrieve messages:", messagesError);
    // Don't redirect, just pass empty messages array
  }

  // fetch user settings
  let {data: userSettingsData, error: userSettingsError} = await supabase
    .from("usersettings")
    .select()
    .single()

  if(userSettingsError || !userSettingsData){
      let {data: insertedUserSettingsData, error: insertedErrorUserSettings} = await supabase
      .from("usersettings")
      .insert({name: "", job: "Assistant", traits: [], user_id: user.data.user.id })
      .single();

      if(insertedErrorUserSettings){
        if(userSettingsError){
          console.error(userSettingsError);
        }
        console.error(insertedErrorUserSettings)
        throw new Error("There was an error inserting user settings");
      }

      userSettingsData = insertedUserSettingsData;
  }

    console.log(userSettingsData);

  // get messages for the chat
  return (
    <HomeClient
      chat={chat}
      shouldReplaceUrl={shouldReplaceUrl}
      userSettings={userSettingsData}
      messages={(messages || []) as Tables<"messages">[]}
    />
  );
}
