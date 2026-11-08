"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LiveRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const skip = pathname.startsWith("/scorekeeper");

  useEffect(() => {
    if (skip) return;

    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout>;

    const channel = supabase
      .channel("matches-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          // Wait a moment so rapid +1 taps trigger one refresh, not ten
          clearTimeout(timer);
          timer = setTimeout(() => router.refresh(), 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [skip, router]);

  return null;
}