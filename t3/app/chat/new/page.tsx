"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewChatPage() {
  const router = useRouter();
  const {setTitle} = useSidebar();

  useEffect(() => {
    setTitle("");
    router.push("/");
  }, [router]); // run once on mount

  return null; // or a loading spinner, skeleton, etc.
}
