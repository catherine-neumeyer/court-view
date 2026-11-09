export type Match = {
  id: number;
  court: string;
  date: string;
  time: string;
  stage?: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  status: "live" | "upcoming" | "final";
  setInfo?: string;
};