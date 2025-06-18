"use client";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (!user.user && !user.isLoading) {
      router.push("/login");
    }
  }, [user, router]);  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto flex max-h-screen min-h-screen">
        {/* Left Sidebar */}
        <div className="w-80 p-6 flex flex-col gap-6">
          <Button
            variant="ghost"
            className="cursor-pointer justify-start"
            onClick={() => router.push("/chat/new")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <div className="text-sm">Back to Chat</div>
          </Button>

          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
                <AvatarImage src={user.user?.user_metadata?.avatar_url} />
            </Avatar>
            <div className="text-center">
              <div className="text-xl font-medium">{user.user?.user_metadata?.name}</div>
              <div className="text-sm text-gray-400">
                {user.user?.email ?? "No email provided"}
              </div>
            </div>
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              Pro Plan
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">Message Usage</div>
              <div className="text-sm">Infinite!</div>
            </div>
            
           
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
