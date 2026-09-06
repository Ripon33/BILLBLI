"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { href: "/workspace", label: "Home" },
  { href: "/workspace/research", label: "Research" },
  { href: "/workspace/study", label: "Study" },
  { href: "/workspace/decisions", label: "Decisions" },
  { href: "/workspace/tasks", label: "Tasks" },
  { href: "/workspace/history", label: "History" },
  { href: "/workspace/settings", label: "Settings" },
  { href: "/workspace/profile", label: "Profile" },
];

export default function AuthNav() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/sign-in");
  }

  return (
    <nav aria-label="Authenticated workspace navigation">
      {navigation.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
      <button type="button" onClick={handleSignOut}>
        Sign out
      </button>
    </nav>
  );
}
