import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: Request){
    const supabase = await createClient();
    const {searchParams} = new URL(request.url);

    const code = searchParams.get("code");

    if(code){
        await supabase.auth.exchangeCodeForSession(code);
    }

    redirect('/');
}