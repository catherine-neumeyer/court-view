"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Live" },
  { href: "/schedule", label: "Schedule" },
  { href: "/teams", label: "Teams" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed bottom-0 left-1/2 flex w-full max-w-md -translate-x-1/2 border-t border-stone-200 bg-white">
      {tabs.map((t) => {
        const active =
          mounted &&
          (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 py-4 text-center text-sm font-semibold ${
              active
                ? "text-blue-700 shadow-[inset_0_3px_0_#1d4ed8]"
                : "text-stone-600"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}