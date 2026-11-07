import { supabase } from "./supabase";
import type { Match } from "./seed";

type Row = {
  id: number;
  start_time: string;
  score_a: number | null;
  score_b: number | null;
  status: Match["status"];
  set_info: string | null;
  court: { name: string };
  team_a: { name: string };
  team_b: { name: string };
};

// "14:40:00" becomes "2:40 PM"
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export async function getCourts(): Promise<string[]> {
  const { data, error } = await supabase
    .from("courts")
    .select("name")
    .order("id");
  if (error) throw error;
  return data.map((c) => c.name);
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `id, start_time, score_a, score_b, status, set_info,
       court:courts(name),
       team_a:teams!team_a_id(name),
       team_b:teams!team_b_id(name)`
    )
    .order("start_time")
    .order("id");
  if (error) throw error;

  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    court: r.court.name,
    time: formatTime(r.start_time),
    teamA: r.team_a.name,
    teamB: r.team_b.name,
    scoreA: r.score_a,
    scoreB: r.score_b,
    status: r.status,
    setInfo: r.set_info ?? undefined,
  }));
}