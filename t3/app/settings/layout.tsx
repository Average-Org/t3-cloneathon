// app/settings/layout.tsx
'use client'; // This layout uses usePathname, so it must be a client component

import Link from 'next/link'; // Import Link for client-side navigation
import { usePathname } from 'next/navigation'; // To determine the active tab
import UserProfilePicture from "@/components/ProfilePicture"; // Adjust path if needed
import UserFullName from "@/components/Username"; // Adjust path if needed

export default function SettingsLayout({
  children, // This prop will be the content of page.tsx files within /settings (e.g., app/settings/customization/page.tsx)
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get the current URL path

  return (
    <div className="flex flex-col h-screen bg-background text-foreground"> {/* Use h-screen for full height */}
   

      {/* Main Content Area (Left Profile & Right Form) */}
      <div className="flex flex-grow overflow-hidden"> {/* flex-grow to take available vertical space */}
        {/* Left Profile Sidebar (static, as seen in screenshots) */}
        <div className="w-1/4 p-6 border-r border-border flex flex-col items-center bg-card">
          <UserProfilePicture />
          <UserFullName />
          <p className="text-sm text-muted-foreground mt-2">Free Plan</p>
          <div className="mt-6 w-full">
            <h4 className="text-sm font-semibold text-foreground mb-2">Message Usage</h4>
            <div className="bg-secondary rounded-full h-2 w-full">
              <div
                className="bg-green-500 h-2 rounded-full" // Using direct Tailwind green for visual match
                style={{ width: `${(0 / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Standard</p>
            <p className="text-xs text-muted-foreground mt-1">0/20 messages remaining</p>
          </div>

          <div className="mt-8 w-full">
            <h4 className="text-sm font-semibold text-foreground mb-3">Keyboard Shortcuts</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-foreground">
                <span>Search</span>
                <span className="bg-secondary px-2 py-1 rounded text-xs text-muted-foreground">Ctrl K</span>
              </div>
              <div className="flex justify-between items-center text-sm text-foreground">
                <span>New Chat</span>
                <span className="bg-secondary px-2 py-1 rounded text-xs text-muted-foreground">Ctrl Shift O</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area (where individual pages will be rendered) */}
        <div className="flex-grow flex flex-col bg-background overflow-y-auto p-6"> {/* Added padding directly to this div for content spacing */}
          {/* Navigation Tabs - Consistent across settings sub-pages */}
          <div className="flex border-b border-border mb-6 pb-0"> {/* Removed p-6 here as parent has it */}
            {/* Use Link components for navigation between tabs */}
            <Link
              href="/settings/account"
              className={`px-4 py-2 text-sm font-medium ${
                pathname === '/settings/account'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Account
            </Link>
            <Link
              href="/settings/customization"
              className={`px-4 py-2 text-sm font-medium ${
                pathname === '/settings/customization'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Customization
            </Link>
            <Link
              href="/settings/history-sync" // Example path
              className={`px-4 py-2 text-sm font-medium ${
                pathname === '/settings/history-sync'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              History & Sync
            </Link>
            <Link
              href="/settings/models" // Example path
              className={`px-4 py-2 text-sm font-medium ${
                pathname === '/settings/models'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Models
            </Link>
            <Link
              href="/settings/api-keys" // Example path
              className={`px-4 py-2 text-sm font-medium ${
                pathname === '/settings/api-keys'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              API Keys
            </Link>
            <Link
              href="/settings/attachments" // Example path
              className={`px-4 py-2 text-sm font-medium ${
                pathname === '/settings/attachments'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Attachments
            </Link>
            <Link
              href="/settings/contact-us" // Example path
              className={`px-4 py-2 text-sm font-medium ${
                pathname === '/settings/contact-us'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Contact Us
            </Link>
          </div>

          {/* Render the specific page content here */}
          {children}
        </div>
      </div>
    </div>
  );
}