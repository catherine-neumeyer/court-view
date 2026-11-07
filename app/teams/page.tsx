import Link from "next/link";
import { teams, teamSlug, teamRecord } from "@/lib/seed";

export default function TeamsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <h1 className="text-2xl font-bold">Teams</h1>
        <p className="text-sm text-stone-600">{teams.length} teams</p>
      </header>

      <ul className="m-4 rounded-2xl border border-stone-200 bg-white px-4">
        {teams.map((t) => {
          const { wins, losses } = teamRecord(t);
          return (
            <li key={t} className="border-b border-stone-200 last:border-b-0">
              <Link
                href={`/teams/${teamSlug(t)}`}
                className="flex min-h-14 items-center justify-between"
              >
                <span className="font-semibold">{t}</span>
                <span className="text-sm text-stone-600">
                  {wins}-{losses}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}