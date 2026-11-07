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
];