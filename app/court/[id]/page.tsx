import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courtSlug } from "@/lib/slug";
import { getCourts, getMatches } from "@/lib/data";

async function CourtContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [courts, matches] = await Promise.all([getCourts(), getMatches()]);
  const court = courts.find((c) => courtSlug(c) === id);
  if (!court) notFound();

  const queue = matches.filter(
    (m) => m.court === court && m.status !== "final"
  );
  const [current, ...upcoming] = queue;
  const isLive = current?.status === "live";

  return (
    <>
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <Link href="/" className="text-sm font-semibold text-blue-700">
          ‹ All courts
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{court}</h1>
          {isLive && (
            <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">
              LIVE
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-3 p-4">
        {current ? (
          <section className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4">
            {current.stage && (
              <p className="text-xs font-bold tracking-wider text-stone-600">
                {current.stage.toUpperCase()}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{current.teamA}</span>
              <span className="text-4xl font-extrabold tabular-nums">
                {current.scoreA ?? "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{current.teamB}</span>
              <span className="text-4xl font-extrabold tabular-nums">
                {current.scoreB ?? "-"}
              </span>
            </div>
            <p className="text-sm text-stone-600">
              {current.setInfo ?? `Starts ${current.time || current.date}`}
            </p>
            {current.referee && (
              <p className="text-sm text-stone-600">Ref: {current.referee}</p>
            )}
          </section>
        ) : (
          <p className="rounded-2xl bg-white p-4 text-stone-600">
            No matches left on this court.
          </p>
        )}

        {/* Stream placeholder, swapped for a real player later */}
        <div className="flex aspect-video items-center justify-center rounded-2xl bg-stone-900 text-sm text-white">
          {court} stream
        </div>

        {upcoming.length > 0 && (
          <>
            <h2 className="mt-1 text-xs font-bold tracking-wider text-stone-600">
              UPCOMING ON THIS COURT
            </h2>
            <ul className="rounded-2xl border border-stone-200 bg-white px-4">
              {upcoming.slice(0, 8).map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 border-b border-stone-200 py-3 last:border-b-0"
                >
                  <span>
                    {m.teamA} vs {m.teamB}
                  </span>
                  <span className="shrink-0 text-sm text-stone-600">
                    {m.time || m.date}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

export default function CourtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="w-full">
      <Suspense fallback={<p className="p-4 text-stone-600">Loading court...</p>}>
        <CourtContent params={params} />
      </Suspense>
    </main>
  );
}