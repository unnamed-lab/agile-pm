"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Zap,
  Menu,
  X,
  Search,
  Command,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

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
  "bg-indigo-500",
  "bg-purple-500",
];

function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
    <aside className="flex flex-col h-full bg-white border-r border-slate-200/80 transition-colors">
      <ThemeToggle />
      {/* Brand logo header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-slate-900 text-base tracking-tight">
            Agile <span className="text-emerald-600 font-extrabold">PM</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search trigger button */}
      <div className="px-3 pt-3">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100/80 text-slate-500 text-xs hover:bg-slate-200/70 transition-colors">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search or command...</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-600 border border-slate-200 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-emerald-500/10 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <AnimatedIcon
                icon={Icon}
                animation={active ? "hover-bounce" : "hover-scale"}
                className={active ? "text-emerald-600" : "text-slate-400"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User Card Footer */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="group flex items-center gap-2.5 px-2 py-2 rounded-lg bg-slate-50 border border-slate-200/60">
          <div
            className={`w-7 h-7 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 md:z-50">
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-spring ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      {/* Main content area */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-slate-200 h-14 flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white">
                <Zap className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="font-display font-bold text-slate-900 text-sm">
                Agile PM
              </span>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
