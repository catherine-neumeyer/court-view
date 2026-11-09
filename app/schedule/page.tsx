import { Suspense } from "react";
import { getMatches } from "@/lib/data";
import ScheduleView from "@/components/ScheduleView";

async function ScheduleContent() {
  const matches = await getMatches();
  return <ScheduleView matches={matches} />;
}

export default function SchedulePage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-100 text-stone-900">
      <Suspense
        fallback={<p className="p-4 text-stone-600">Loading schedule...</p>}
      >
        <ScheduleContent />
      </Suspense>
    </main>
  );
}