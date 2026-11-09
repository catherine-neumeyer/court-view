import { Suspense } from "react";
import Link from "next/link";
import { teamSlug } from "@/lib/slug";
import { getMatches, getPoolTeams, teamRecord } from "@/lib/data";

async function TeamsContent() {
  const [teams, matches] = await Promise.all([getPoolTeams(), getMatches()]);

  return (
    <>
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <h1 className="text-2xl font-bold">Teams</h1>
        <p className="text-sm text-stone-600">{teams.length} teams</p>
      </header>

      <div className="flex flex-col gap-6 p-4">
        {(["Men", "Women"] as const).map((div) => {
          const inDiv = teams.filter((t) => t.division === div);
          const pools = Array.from(new Set(inDiv.map((t) => t.pool ?? "-"))).sort();
          return (
            <section key={div} className="flex flex-col gap-3">
              <h2 className="text-xl font-bold">{div}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {pools.map((pool) => (
                  <div
                    key={pool}
                    className="rounded-2xl border border-stone-200 bg-white px-4"
                  >
                    <h3 className="pt-3 text-xs font-bold tracking-wider text-stone-600">
                      POOL {pool}
                    </h3>
                    <ul>
                      {inDiv
                        .filter((t) => (t.pool ?? "-") === pool)
                        .map((t) => {
                          const { wins, losses } = teamRecord(matches, t.name);
                          return (
                            <li
                              key={t.name}
                              className="border-b border-stone-200 last:border-b-0"
                            >
                              <Link
                                href={`/teams/${teamSlug(t.name)}`}
                                className="flex min-h-12 items-center justify-between"
                              >
                                <span className="font-semibold">
                                  {t.name.replace(/ (Men|Women)$/, "")}
                                </span>
                                <span className="text-sm text-stone-600">
                                  {wins}-{losses}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function TeamsPage() {
  return (
    <main className="w-full">
      <Suspense fallback={<p className="p-4 text-stone-600">Loading teams...</p>}>
        <TeamsContent />
      </Suspense>
    </main>
  );
}