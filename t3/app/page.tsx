import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data || !user.data.user) {
    redirect("/login");
  } else {
    redirect("/chat/new");
  }
}
