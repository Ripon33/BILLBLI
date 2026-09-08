"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { href: "/workspace", label: "Home", icon: "⌂" },
  { href: "/workspace/research", label: "Research", icon: "⌕" },
  { href: "/workspace/study", label: "Study", icon: "◌" },
  { href: "/workspace/decisions", label: "Decisions", icon: "✓" },
  { href: "/workspace/tasks", label: "Tasks", icon: "□" },
  { href: "/workspace/history", label: "History", icon: "↺" },
];

const secondaryNavigation = [
  { href: "/workspace/settings", label: "Settings", icon: "⚙" },
  { href: "/workspace/profile", label: "Profile", icon: "○" },
];

type BillbliSidebarProps = {
  pathname: string;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
  onCloseMobile?: () => void;
  recentContent?: ReactNode;
};

export default function BillbliSidebar({
  pathname,
  collapsed = false,
  mobileOpen = false,
  onCollapse,
  onExpand,
  onCloseMobile,
  recentContent,
}: BillbliSidebarProps) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/sign-in");
  }

  function isActive(href: string) {
    if (href === "/workspace") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const state = collapsed ? "collapsed" : "expanded";

  return (
    <aside
      aria-label="BILLBLI workspace sidebar"
      data-sidebar-state={state}
      data-sidebar-preference="billbli-sidebar-collapsed"
      className={[
        "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-zinc-200 bg-white",
        "transition-[transform,width] duration-200 ease-out",
        "lg:sticky lg:top-0 lg:h-screen",
        collapsed ? "lg:w-[76px]" : "",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-zinc-100 px-4">
        <Link
          href="/workspace"
          aria-label="BILLBLI home"
          className={[
            "flex min-w-0 items-center gap-3 rounded-lg px-2 py-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
          ].join(" ")}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">
            B
          </span>

          {!collapsed && (
            <span className="text-lg font-bold tracking-[-0.03em] text-zinc-950">
              BILLBLI
            </span>
          )}
        </Link>

        {mobileOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onCloseMobile}
            className="rounded-lg border border-zinc-200 px-2.5 py-2 text-sm text-zinc-600 lg:hidden"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <nav aria-label="Authenticated workspace navigation">
          <div className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  onClick={onCloseMobile}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                    active
                      ? "bg-emerald-50 text-zinc-950 ring-1 ring-emerald-100"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                    collapsed ? "justify-center" : "",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-base"
                  >
                    {item.icon}
                  </span>

                  {!collapsed && <span>{item.label}</span>}

                  {active && (
                    <span className="sr-only">Current page</span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="my-5 border-t border-zinc-100" />

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  onClick={onCloseMobile}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                    active
                      ? "bg-emerald-50 text-zinc-950 ring-1 ring-emerald-100"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                    collapsed ? "justify-center" : "",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-base"
                  >
                    {item.icon}
                  </span>

                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              title={collapsed ? "Sign out" : undefined}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium",
                "text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                "disabled:cursor-wait disabled:opacity-50",
                collapsed ? "justify-center" : "",
              ].join(" ")}
            >
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center text-base">
                ↪
              </span>

              {!collapsed && (
                <span>{signingOut ? "Signing out…" : "Sign out"}</span>
              )}
            </button>
          </div>
        </nav>
      </div>

      <div className="shrink-0 border-t border-zinc-100 p-3">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2.5">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                BILLBLI
              </div>
              <div className="mt-0.5 truncate text-xs text-zinc-500">
                Research deeper. Decide better.
              </div>
            </div>

            <button
              type="button"
              aria-label="Collapse sidebar"
              onClick={onCollapse}
              className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              ‹
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={onExpand}
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            ›
          </button>
        )}
      </div>
    </aside>
  );
}
