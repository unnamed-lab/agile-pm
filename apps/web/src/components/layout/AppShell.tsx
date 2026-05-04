"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Sprout,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AppShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
];

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-stone-500",
  "bg-slate-500",
];

function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const bgColor = avatarColor(user?.name ?? "U");

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href + "/"))
    );
  }

  const sidebar = (
    <aside className="flex flex-col h-full bg-white border-r border-stone-200">
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-stone-100 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-stone-900 tracking-tight">
            Agile PM
          </span>
        </Link>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${active ? "text-emerald-600" : "text-stone-400"}`}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-stone-100 shrink-0">
        <div className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-stone-50 transition-colors">
          <div
            className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900 truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-stone-500 truncate">
              {user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 opacity-0 group-hover:opacity-100 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 md:z-50">
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in) */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-spring ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white/80 backdrop-blur-sm border-b border-stone-200 h-14 flex items-center px-4 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors mr-3"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-stone-900 text-sm">
              Agile PM
            </span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
