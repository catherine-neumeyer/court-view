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