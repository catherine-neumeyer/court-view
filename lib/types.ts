export type Match = {
  id: number;
  court: string;
  date: string;
  time: string;
  stage?: string;
  division: "Men" | "Women";
  teamA: string;
  teamB: string;
  teamAKnown: boolean;
  teamBKnown: boolean;
  scoreA: number | null;
  scoreB: number | null;
  status: "live" | "upcoming" | "final";
  setInfo?: string;
  referee?: string;
};