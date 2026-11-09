"use client";

import { useState } from "react";
import type { Match } from "@/lib/types";

const statuses = ["all", "live", "upcoming", "final"] as const;
type StatusFilter = (typeof statuses)[number];
const divisions = ["all", "Men", "Women"] as const;
type Division = (typeof divisions)[number];

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
      className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${
        active
          ? "border-blue-700 bg-blue-700 text-white"
          : "border-stone-300 bg-white text-stone-900"
      }`}
    >
      {label}
    </button>
  );
}

export default function ScheduleView({ matches }: { matches: Match[] }) {
  const days = ["all", ...Array.from(new Set(matches.map((m) => m.date)))];
  const [day, setDay] = useState("all");
  const [division, setDivision] = useState<Division>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = matches.filter(
    (m) =>
      (day === "all" || m.date === day) &&
      (division === "all" || m.stage?.endsWith(` - ${division}`)) &&
      (status === "all" || m.status === status)
  );

  const groups = filtered.reduce<Record<string, Match[]>>((acc, m) => {
    (acc[m.date] ??= []).push(m);
    return acc;
  }, {});

  return (
    <>
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {days.map((d) => (
            <Chip key={d} label={d === "all" ? "All days" : d} active={day === d} onClick={() => setDay(d)} />
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {divisions.map((d) => (
            <Chip key={d} label={d === "all" ? "Men and women" : d} active={division === d} onClick={() => setDivision(d)} />
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {statuses.map((s) => (
            <Chip key={s} label={s === "all" ? "Any status" : s} active={status === s} onClick={() => setStatus(s)} />
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-2 p-4">
        {filtered.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-stone-600">
            No matches for these filters.
          </p>
        )}
        {Object.entries(groups).map(([date, list]) => (
          <section key={date} className="flex flex-col gap-2">
            <h2 className="mt-2 text-xs font-bold tracking-wider text-stone-600">
              {date.toUpperCase()}
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
                  {m.scoreA !== null ? (
                    <span className="font-bold tabular-nums">
                      {m.scoreA}-{m.scoreB}
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${pill[m.status]}`}
                    >
                      {m.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-600">
                  {[m.time, m.court, m.stage].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}