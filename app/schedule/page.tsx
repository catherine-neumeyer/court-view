"use client";

import { useState } from "react";
import { courts, matches, type Match } from "@/lib/seed";

const statuses = ["all", "live", "upcoming", "final"] as const;
type StatusFilter = (typeof statuses)[number];

const pill: Record<Match["status"], string> = {
  live: "bg-red-700 text-white",
  upcoming: "bg-stone-200 text-stone-800",
  final: "bg-green-100 text-green-900",
};

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold capitalize ${
        active
          ? "border-blue-700 bg-blue-700 text-white"
          : "border-stone-300 bg-white text-stone-900"
      }`}
    >
      {label}
    </button>
  );
}

export default function SchedulePage() {
  const [court, setCourt] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = matches.filter(
    (m) =>
      (court === "all" || m.court === court) &&
      (status === "all" || m.status === status)
  );

  // Group by start time, keeping the order from the seed data
  const groups = filtered.reduce<Record<string, Match[]>>((acc, m) => {
    (acc[m.time] ??= []).push(m);
    return acc;
  }, {});

  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {["all", ...courts].map((c) => (
            <Chip key={c} label={c} active={court === c} onClick={() => setCourt(c)} />
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {statuses.map((s) => (
            <Chip key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-2 p-4">
        {filtered.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-stone-600">
            No matches for these filters.
          </p>
        )}
        {Object.entries(groups).map(([time, list]) => (
          <section key={time} className="flex flex-col gap-2">
            <h2 className="mt-2 text-xs font-bold tracking-wider text-stone-600">
              {time}
            </h2>
            {list.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {m.teamA} vs {m.teamB}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${pill[m.status]}`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-sm text-stone-600">{m.court}</p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}