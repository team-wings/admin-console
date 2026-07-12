"use client";

import { Icon } from "@/components/ui/Icon";

type TopBarUser = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile_image: string | null;
  is_online: boolean;
  is_staff: boolean;
  can_create: boolean;
  can_retrieve: boolean;
};

type TopBarProps = {
  title?: string;
  showBack?: boolean;
  user?: TopBarUser | null;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
};

export function TopBar({ title, showBack, user, onToggleSidebar, sidebarOpen }: TopBarProps) {
  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase() || "?"
    : "?";

  return (
    <header className={`fixed top-0 right-0 z-30 bg-primary shadow-sm border-b border-white/10 h-16 flex justify-between items-center px-6 py-2 transition-all duration-300 ${sidebarOpen ? "left-64" : "left-0"}`}>
      <div className="flex items-center gap-4 flex-1">
        <button
          className="text-white/70 hover:text-white transition-colors lg:hidden"
          onClick={onToggleSidebar}
        >
          <Icon name={sidebarOpen ? "close" : "menu"} />
        </button>
        <button
          className="text-white/70 hover:text-white transition-colors hidden lg:block"
          onClick={onToggleSidebar}
        >
          <Icon name={sidebarOpen ? "close" : "menu"} />
        </button>
        {showBack && (
          <button className="text-white/70 hover:text-white transition-colors">
            <Icon name="arrow_back" />
          </button>
        )}
        {title && (
          <h2 className="text-headline-md font-bold text-white">{title}</h2>
        )}
        <div className="relative w-96">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
          />
          <input
            className="w-full pl-10 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-secondary-container focus:border-secondary-container text-body-sm transition-all"
            placeholder="Search accounts, trades, or entities..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button className="relative p-1.5 text-white/70 hover:text-white transition-colors">
            <Icon name="notifications" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="p-1.5 text-white/70 hover:text-white transition-colors">
            <Icon name="help_outline" />
          </button>
        </div>

        <button className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-lg font-bold text-body-sm hover:opacity-90 transition-opacity">
          New Transaction
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          {user && (
            <div className="text-right">
              <p className="font-bold text-body-sm leading-none text-white">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-label-md text-white/60">{user.email}</p>
            </div>
          )}
          <div className="relative shrink-0">
            {user?.profile_image ? (
              <img
                alt={`${user.first_name} ${user.last_name}`}
                className="w-10 h-10 rounded-full border border-white/20 object-cover"
                src={user.profile_image}
              />
            ) : (
              <div className="w-10 h-10 rounded-full border border-white/20 bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
            )}
            {user?.is_online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-primary" />
            )}
          </div>
          {user && (user.is_staff || user.can_create || user.can_retrieve) && (
            <div className="hidden xl:flex flex-col gap-0.5">
              {user.is_staff && (
                <span className="text-[10px] font-bold text-secondary-container bg-secondary-container/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Staff
                </span>
              )}
              {(user.can_create || user.can_retrieve) && (
                <span className="text-[10px] text-white/60 px-1.5">
                  {user.can_create && user.can_retrieve
                    ? "Read + Write"
                    : user.can_create
                      ? "Write only"
                      : "Read only"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
