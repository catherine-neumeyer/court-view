import { supabase } from "./supabase";
import type { Match } from "./types";
import {
  MATCH_SELECT,
  TEAM_SELECT,
  computeStandings,
  parseMatches,
  parseTeams,
  resolveMatches,
} from "./standings";

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

async function loadTournament() {
  const [teamsRes, matchesRes] = await Promise.all([
    supabase.from("teams").select(TEAM_SELECT),
    supabase.from("matches").select(MATCH_SELECT).order("seq"),
  ]);
  if (teamsRes.error) throw teamsRes.error;
  if (matchesRes.error) throw matchesRes.error;

  const teams = parseTeams(teamsRes.data);
  const raw = parseMatches(matchesRes.data);

  const matches: Match[] = resolveMatches(raw, teams).map((m) => ({
    id: m.id,
    court: m.court,
    date: formatDate(m.matchDate),
    time: formatTime(m.startTime),
    stage: m.stage ?? undefined,
    division: m.division,
    teamA: m.teamA?.name ?? m.labelA ?? "TBC",
    teamB: m.teamB?.name ?? m.labelB ?? "TBC",
    teamAKnown: !!m.teamA,
    teamBKnown: !!m.teamB,
    scoreA: m.scoreA,
    scoreB: m.scoreB,
    status: m.status,
    setInfo: m.setInfo ?? undefined,
    referee: m.referee ?? undefined,
  }));

  return { teams, matches, tables: computeStandings(teams, raw) };
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
  return (await loadTournament()).matches;
}

export async function getTeams(): Promise<string[]> {
  const { teams } = await loadTournament();
  return teams.map((t) => t.name).sort();
}

export async function getStandingsData() {
  const { matches, tables } = await loadTournament();
  return { matches, tables };
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