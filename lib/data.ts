import { supabase } from "./supabase";
import type { Match } from "./types";

type Row = {
  id: number;
  match_date: string | null;
  start_time: string | null;
  stage: string | null;
  label_a: string | null;
  label_b: string | null;
  score_a: number | null;
  score_b: number | null;
  status: Match["status"];
  set_info: string | null;
  court: { name: string };
  team_a: { name: string } | null;
  team_b: { name: string } | null;
  referee: string | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-11-06" becomes "Fri 6 Nov"
function formatDate(d: string | null) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
  return `${weekday} ${day} ${MONTHS[m - 1]}`;
}

// "14:40:00" becomes "2:40 PM"
function formatTime(t: string | null) {
  if (!t) return "";
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
      `id, match_date, start_time, stage, label_a, label_b, referee,
       score_a, score_b, status, set_info,
       court:courts(name),
       team_a:teams!team_a_id(name),
       team_b:teams!team_b_id(name)`
    )
    .order("seq");
  if (error) throw error;

  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    court: r.court.name,
    date: formatDate(r.match_date),
    time: formatTime(r.start_time),
    stage: r.stage ?? undefined,
    teamA: r.team_a?.name ?? r.label_a ?? "TBC",
    teamB: r.team_b?.name ?? r.label_b ?? "TBC",
    scoreA: r.score_a,
    scoreB: r.score_b,
    status: r.status,
    setInfo: r.set_info ?? undefined,
    referee: r.referee ?? undefined,
  }));
}

export async function getTeams(): Promise<string[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("name")
    .order("name");
  if (error) throw error;
  return data.map((t) => t.name);
}

export function teamRecord(matches: Match[], team: string) {
  let wins = 0;
  let losses = 0;
  for (const m of matches) {
    if (m.status !== "final" || m.scoreA === null || m.scoreB === null) continue;
    if (m.teamA !== team && m.teamB !== team) continue;
    const won = m.teamA === team ? m.scoreA > m.scoreB : m.scoreB > m.scoreA;
    if (won) wins++;
    else losses++;
  }
  return { wins, losses };
}

export type PoolTeam = {
  name: string;
  division: "Men" | "Women";
  pool: string | null;
};

export async function getPoolTeams(): Promise<PoolTeam[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("name, division, pool")
    .order("name");
  if (error) throw error;
  return data as PoolTeam[];
}