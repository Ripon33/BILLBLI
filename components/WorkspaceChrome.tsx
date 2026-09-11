"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type WorkspaceChromeProps = {
  children: React.ReactNode;
};

const primaryNavigation = [
  { href: "/workspace", label: "Home" },
  { href: "/workspace/research", label: "Research" },
  { href: "/workspace/study", label: "Study" },
  { href: "/workspace/decisions", label: "Decisions" },
  { href: "/workspace/tasks", label: "Tasks" },
  { href: "/workspace/history", label: "History" },
  { href: "/workspace/workers", label: "AI Workforce" },
];

const secondaryNavigation = [
  { href: "/workspace/settings", label: "Settings" },
  { href: "/workspace/profile", label: "Profile" },
];

function isActive(pathname: string, href: string) {
  if (href === "/workspace") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function WorkspaceChrome({ children }: WorkspaceChromeProps) {
  const pathname = usePathname() ?? "/workspace";
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      <div className="flex min-h-screen">
        <aside
          aria-label="BILLBLI workspace navigation"
          className="hidden w-[240px] shrink-0 border-r border-zinc-200 bg-white lg:block"
        >
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-zinc-100 px-5 py-5">
              <Link
                href="/workspace"
                className="inline-flex items-center rounded-lg text-lg font-bold tracking-[-0.03em] text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                BILLBLI
              </Link>
            </div>

            <nav
              aria-label="Authenticated workspace navigation"
              className="flex-1 overflow-y-auto px-3 py-5"
            >
              <div className="space-y-1">
                {primaryNavigation.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "block rounded-xl px-3 py-2.5 text-sm font-medium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                        active
                          ? "bg-emerald-50 text-zinc-950"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="my-5 border-t border-zinc-100" />

              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "block rounded-xl px-3 py-2.5 text-sm font-medium",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                        active
                          ? "bg-emerald-50 text-zinc-950"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
