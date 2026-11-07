export type Match = {
  id: number;
  court: string;
  time: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  status: "live" | "upcoming" | "final";
  setInfo?: string;
};

export const courts = ["Court 1", "Court 2", "Court 3"];

// listed in time order
export const matches: Match[] = [
  { id: 1, court: "Court 1", time: "2:00 PM", teamA: "Riverside", teamB: "Northgate", scoreA: 21, scoreB: 18, status: "live", setInfo: "Set 2, Riverside leads 1-0" },
  { id: 2, court: "Court 2", time: "2:00 PM", teamA: "Lakeview", teamB: "Cedar Park", scoreA: 9, scoreB: 11, status: "live", setInfo: "Set 1" },
  { id: 3, court: "Court 1", time: "2:40 PM", teamA: "Hillcrest", teamB: "Eastside", scoreA: null, scoreB: null, status: "upcoming" },
  { id: 4, court: "Court 2", time: "2:40 PM", teamA: "Summit", teamB: "Oakridge", scoreA: null, scoreB: null, status: "upcoming" },
  { id: 5, court: "Court 3", time: "3:10 PM", teamA: "Westfield", teamB: "Harbor", scoreA: null, scoreB: null, status: "upcoming" },
  { id: 6, court: "Court 3", time: "3:50 PM", teamA: "Ridge", teamB: "Birchwood", scoreA: null, scoreB: null, status: "upcoming" },
  { id: 7, court: "Court 3", time: "1:20 PM", teamA: "Riverside", teamB: "Harbor", scoreA: 25, scoreB: 19, status: "final", setInfo: "Final" },
  { id: 8, court: "Court 1", time: "12:40 PM", teamA: "Northgate", teamB: "Hillcrest", scoreA: 25, scoreB: 23, status: "final", setInfo: "Final" },
];

export const teams = Array.from(
  new Set(matches.flatMap((m) => [m.teamA, m.teamB]))
).sort();

// "Cedar Park" becomes "cedar-park", used in the URL
export const teamSlug = (team: string) =>
  team.toLowerCase().replace(/\s+/g, "-");

export function teamRecord(team: string) {
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