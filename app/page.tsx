import { courts, matches } from "@/lib/seed";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white px-5 pb-3 pt-5">
        <h1 className="text-2xl font-bold">Spring Open</h1>
        <p className="text-sm text-stone-600">{courts.length} courts in play</p>
      </header>

      <div className="flex flex-col gap-3 p-4">
        {courts.map((court) => {
          const queue = matches.filter(
            (m) => m.court === court && m.status !== "final"
          );
          const current = queue[0];
          const next = queue[1];
          if (!current) return null;
          const isLive = current.status === "live";

          return (
            <section
              key={court}
              className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-wider text-stone-600">
                  {court.toUpperCase()}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isLive ? "bg-red-700 text-white" : "bg-stone-200 text-stone-800"
                  }`}
                >
                  {isLive ? "LIVE" : `UP NEXT · ${current.time}`}
                </span>
              </div>

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

              {current.setInfo && (
                <p className="text-sm text-stone-600">{current.setInfo}</p>
              )}

              {next && (
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm text-stone-600">
                  <span>
                    Next: {next.teamA} vs {next.teamB}
                  </span>
                  <span>{next.time}</span>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}