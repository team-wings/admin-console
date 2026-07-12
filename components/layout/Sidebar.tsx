"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/components/AuthContext";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-64 flex flex-col bg-primary border-r border-white/10 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary-container rounded-sm flex items-center justify-center text-on-secondary-container">
              <Icon name="analytics" filled />
            </div>
            <div>
              <h1 className="text-headline-md font-bold text-white">ES Payment</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = !!pathname && (pathname === item.href || pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-secondary text-on-secondary font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon name={item.icon} filled={isActive} className={isActive ? "" : "text-white/70"} />
                <span className="text-body-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-white/10 mt-auto">
          <button className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
            <Icon name="send" />
            Quick Transfer
          </button>
          <div className="mt-4 space-y-1">
            {BOTTOM_NAV_ITEMS.map((item) =>
              item.label === "Logout" ? (
                <button
                  key={item.label}
                  onClick={() => { onClose(); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon name={item.icon} className="text-white/70" />
                  <span className="text-body-sm">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon name={item.icon} className="text-white/70" />
                  <span className="text-body-sm">{item.label}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
