"use client";

import { useState } from "react";
import Link from "next/link";
import type { Match } from "@/lib/types";
import type { PoolTable } from "@/lib/standings";
import { teamSlug } from "@/lib/slug";
import { shortName } from "@/lib/format";

type View = "pools" | "bracket";
type Division = "Men" | "Women";
type Cup = "Cup" | "Shield";

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

function TeamName({ name, known }: { name: string; known: boolean }) {
  if (!known) return <span className="text-stone-500">{name}</span>;
  return (
    <Link href={`/teams/${teamSlug(name)}`} className="hover:underline">
      {shortName(name)}
    </Link>
  );
}

function Pools({ tables }: { tables: PoolTable[] }) {
  const anyTied = tables.some((t) => t.complete && t.rows.some((r) => r.tied));
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        {tables.map((t) => (
          <section
            key={`${t.division}-${t.pool}`}
            className="rounded-2xl border border-stone-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-wider text-stone-600">
                GROUP {t.pool}
              </h2>
              {t.complete && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-900">
                  FINAL
                </span>
              )}
            </div>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-xs text-stone-600">
                  <th className="py-1 pr-1 text-left font-semibold">#</th>
                  <th className="py-1 text-left font-semibold">Team</th>
                  <th className="px-1 text-right font-semibold">P</th>
                  <th className="px-1 text-right font-semibold">W</th>
                  <th className="hidden px-1 text-right font-semibold md:table-cell">D</th>
                  <th className="px-1 text-right font-semibold">L</th>
                  <th className="hidden px-1 text-right font-semibold md:table-cell">PF</th>
                  <th className="hidden px-1 text-right font-semibold md:table-cell">PA</th>
                  <th className="px-1 text-right font-semibold">GD</th>
                  <th className="pl-1 text-right font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r, i) => (
                  <tr key={r.team.id} className="border-t border-stone-200">
                    <td className="py-2 pr-1 text-stone-600">{i + 1}</td>
                    <td className="py-2 font-semibold">
                      <TeamName name={r.team.name} known />
                      {t.complete && r.tied ? " *" : ""}
                    </td>
                    <td className="px-1 text-right tabular-nums">{r.played}</td>
                    <td className="px-1 text-right tabular-nums">{r.won}</td>
                    <td className="hidden px-1 text-right tabular-nums md:table-cell">{r.drawn}</td>
                    <td className="px-1 text-right tabular-nums">{r.lost}</td>
                    <td className="hidden px-1 text-right tabular-nums md:table-cell">{r.pf}</td>
                    <td className="hidden px-1 text-right tabular-nums md:table-cell">{r.pa}</td>
                    <td className="px-1 text-right tabular-nums">
                      {r.gd > 0 ? `+${r.gd}` : r.gd}
                    </td>
                    <td className="pl-1 text-right font-bold tabular-nums">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
      {anyTied && (
        <p className="text-xs text-stone-600">
          * Level on points, goal difference and head-to-head.
        </p>
      )}
    </div>
  );
}

const ROUND_ORDER = ["Playoff", "Quarter-finals", "Semi-finals", "Final"];

function stageKey(stage: string) {
  return stage.replace(/ - (Men|Women)$/i, "");
}

function roundOf(stage: string) {
  const key = stageKey(stage);
  if (/\bQF\b/i.test(key)) return "Quarter-finals";
  if (/\bSF\b/i.test(key)) return "Semi-finals";
  if (/^(cup|shield) final$/i.test(key)) return "Final";
  if (/^shield playoff$/i.test(key)) return "Playoff";
  return "Placement";
}

function BracketMatch({ m }: { m: Match }) {
  const done = m.status === "final" && m.scoreA !== null && m.scoreB !== null;
  const aWon = done && (m.scoreA as number) > (m.scoreB as number);
  const bWon = done && (m.scoreB as number) > (m.scoreA as number);
  const when = [m.date, m.time].filter(Boolean).join(" · ");

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
      <p className="mb-1 text-xs font-bold tracking-wider text-stone-600">
        {stageKey(m.stage ?? "").toUpperCase()}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className={aWon ? "font-bold" : ""}>
          <TeamName name={m.teamA} known={m.teamAKnown} />
        </span>
        <span className="tabular-nums">{m.scoreA ?? ""}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={bWon ? "font-bold" : ""}>
          <TeamName name={m.teamB} known={m.teamBKnown} />
        </span>
        <span className="tabular-nums">{m.scoreB ?? ""}</span>
      </div>
      {when && <p className="mt-1 text-xs text-stone-600">{when}</p>}
    </div>
  );
}

function Bracket({
  matches,
  division,
  cup,
}: {
  matches: Match[];
  division: Division;
  cup: Cup;
}) {
  const [selected, setSelected] = useState("");

  const list = matches.filter(
    (m) =>
      m.division === division &&
      m.stage &&
      m.stage.toLowerCase().startsWith(`${cup.toLowerCase()} `)
  );
  const rounds = ROUND_ORDER.filter((r) =>
    list.some((m) => roundOf(m.stage as string) === r)
  );
  const placement = list.filter((m) => roundOf(m.stage as string) === "Placement");
  const active = rounds.includes(selected) ? selected : rounds[0];

  if (list.length === 0) {
    return <p className="p-4 text-stone-600">No matches found.</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2 overflow-x-auto md:hidden">
        {rounds.map((r) => (
          <Chip key={r} label={r} active={active === r} onClick={() => setSelected(r)} />
        ))}
      </div>

      <div className="md:flex md:gap-6">
        {rounds.map((r) => (
          <div
            key={r}
            className={`${active === r ? "flex" : "hidden md:flex"} flex-1 flex-col gap-3`}
          >
            <h3 className="hidden text-xs font-bold tracking-wider text-stone-600 md:block">
              {r.toUpperCase()}
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {list
                .filter((m) => roundOf(m.stage as string) === r)
                .map((m) => (
                  <BracketMatch key={m.id} m={m} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {placement.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-wider text-stone-600">
            PLACEMENT MATCHES
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {placement.map((m) => (
              <BracketMatch key={m.id} m={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function StandingsView({
  tables,
  matches,
}: {
  tables: PoolTable[];
  matches: Match[];
}) {
  const [view, setView] = useState<View>("pools");
  const [division, setDivision] = useState<Division>("Men");
  const [cup, setCup] = useState<Cup>("Cup");

  return (
    <>
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <h1 className="text-2xl font-bold">Standings</h1>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <Chip label="Pools" active={view === "pools"} onClick={() => setView("pools")} />
          <Chip label="Bracket" active={view === "bracket"} onClick={() => setView("bracket")} />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          <Chip label="Men" active={division === "Men"} onClick={() => setDivision("Men")} />
          <Chip label="Women" active={division === "Women"} onClick={() => setDivision("Women")} />
        </div>
        {view === "bracket" && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            <Chip label="Cup" active={cup === "Cup"} onClick={() => setCup("Cup")} />
            <Chip label="Shield" active={cup === "Shield"} onClick={() => setCup("Shield")} />
          </div>
        )}
      </header>

      {view === "pools" ? (
        <Pools tables={tables.filter((t) => t.division === division)} />
      ) : (
        <Bracket matches={matches} division={division} cup={cup} />
      )}
    </>
  );
}