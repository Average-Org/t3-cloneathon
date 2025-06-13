"use client";
import HomeClient from "@/app/home-client";
import { useParams } from "next/navigation";

export default function ChatRoute() {
  const { id } = useParams<{id: string}>();
  return <HomeClient chatId={id} />;
}
