"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]); // run once on mount

  return null; // or a loading spinner, skeleton, etc.
}
