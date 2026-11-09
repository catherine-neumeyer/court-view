import { Suspense } from "react";
import { getStandingsData } from "@/lib/data";
import StandingsView from "@/components/StandingsView";

async function StandingsContent() {
  const { tables, matches } = await getStandingsData();
  return <StandingsView tables={tables} matches={matches} />;
}

export default function StandingsPage() {
  return (
    <main className="w-full">
      <Suspense
        fallback={<p className="p-4 text-stone-600">Loading standings...</p>}
      >
        <StandingsContent />
      </Suspense>
    </main>
  );
}