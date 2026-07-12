"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    profile_image: string | null;
    is_online: boolean;
    is_staff: boolean;
    can_create: boolean;
    can_retrieve: boolean;
  } | null;
};

export function AppShell({ children, title, showBack, user }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar
        title={title}
        showBack={showBack}
        user={user}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />
      <main className={`mt-16 p-6 min-h-[calc(100vh-64px)] transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="max-w-[1200px] mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
