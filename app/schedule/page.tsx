import { Suspense } from "react";
import { getMatches } from "@/lib/data";
import ScheduleView from "@/components/ScheduleView";

async function ScheduleContent() {
  const matches = await getMatches();
  return <ScheduleView matches={matches} />;
}

export default function SchedulePage() {
  return (
    <main className="">
      <Suspense
        fallback={<p className="p-4 text-stone-600">Loading schedule...</p>}
      >
        <ScheduleContent />
      </Suspense>
    </main>
  );
}