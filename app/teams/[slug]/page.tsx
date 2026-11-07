import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { teamSlug } from "@/lib/slug";
import { getMatches, getTeams, teamRecord } from "@/lib/data";

async function TeamContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [teams, matches] = await Promise.all([getTeams(), getMatches()]);
  const team = teams.find((t) => teamSlug(t) === slug);
  if (!team) notFound();

  const { wins, losses } = teamRecord(matches, team);
  const teamMatches = matches.filter(
    (m) => m.teamA === team || m.teamB === team
  );

  return (
    <>
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <Link href="/teams" className="text-sm font-semibold text-blue-700">
          ‹ All teams
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{team}</h1>
        <p className="text-sm text-stone-600">
          Record: {wins}-{losses}
        </p>
      </header>

      <div className="flex flex-col gap-2 p-4">
        {teamMatches.map((m) => {
          const opponent = m.teamA === team ? m.teamB : m.teamA;
          const mine = m.teamA === team ? m.scoreA : m.scoreB;
          const theirs = m.teamA === team ? m.scoreB : m.scoreA;
          return (
            <div
              key={m.id}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">vs {opponent}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {mine === null ? m.time : `${mine}-${theirs}`}
                </span>
              </div>
              <p className="text-sm text-stone-600">
                {m.court} · {m.time} · {m.status}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-100 text-stone-900">
      <Suspense fallback={<p className="p-4 text-stone-600">Loading team...</p>}>
        <TeamContent params={params} />
      </Suspense>
    </main>
  );
}