"use client";

import type { ReactNode } from "react";
import BillbliSidebar from "./BillbliSidebar";

type BillbliShellProps = {
  pathname: string;
  children: ReactNode;
  sidebarCollapsed?: boolean;
  mobileSidebarOpen?: boolean;
  onCollapseSidebar?: () => void;
  onExpandSidebar?: () => void;
  onCloseMobileSidebar?: () => void;
  recentContent?: ReactNode;
  utilityContent?: ReactNode;
};

export default function BillbliShell({
  pathname,
  children,
  sidebarCollapsed = false,
  mobileSidebarOpen = false,
  onCollapseSidebar,
  onExpandSidebar,
  onCloseMobileSidebar,
  recentContent,
  utilityContent,
}: BillbliShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      <div className="flex min-h-screen">
        <BillbliSidebar
          pathname={pathname}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCollapse={onCollapseSidebar}
          onExpand={onExpandSidebar}
          onCloseMobile={onCloseMobileSidebar}
          recentContent={recentContent}
        />

        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close BILLBLI sidebar"
            onClick={onCloseMobileSidebar}
            className="fixed inset-0 z-30 bg-zinc-950/20 lg:hidden"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            aria-label="BILLBLI workspace utilities"
            className="sticky top-0 z-20 flex min-h-[76px] shrink-0 items-center border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6"
          >
            {utilityContent ?? (
              <div className="text-sm font-medium text-zinc-500">
                BILLBLI
              </div>
            )}
          </header>

          <main
            aria-label="BILLBLI workspace content"
            className="min-w-0 flex-1"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
