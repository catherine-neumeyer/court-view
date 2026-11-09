export type Division = "Men" | "Women";

export type RawTeam = {
  id: number;
  name: string;
  division: Division;
  pool: string | null;
};

export type RawMatch = {
  id: number;
  seq: number;
  court: string;
  matchDate: string | null;
  startTime: string | null;
  stage: string | null;
  labelA: string | null;
  labelB: string | null;
  referee: string | null;
  scoreA: number | null;
  scoreB: number | null;
  status: "live" | "upcoming" | "final";
  setInfo: string | null;
  teamAId: number | null;
  teamBId: number | null;
};

export type StandingRow = {
  team: RawTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  pf: number;
  pa: number;
  gd: number;
  tied: boolean;
};

export type PoolTable = {
  division: Division;
  pool: string;
  complete: boolean;
  rows: StandingRow[];
};

export type ResolvedMatch = RawMatch & {
  division: Division;
  teamA: RawTeam | null;
  teamB: RawTeam | null;
};

export const TEAM_SELECT = "id, name, division, pool";
export const MATCH_SELECT =
  "id, seq, match_date, start_time, stage, label_a, label_b, referee, score_a, score_b, status, set_info, team_a_id, team_b_id, court:courts(name)";

type TeamRow = {
  id: number;
  name: string;
  division: Division | null;
  pool: string | null;
};

type MatchRow = {
  id: number;
  seq: number;
  match_date: string | null;
  start_time: string | null;
  stage: string | null;
  label_a: string | null;
  label_b: string | null;
  referee: string | null;
  score_a: number | null;
  score_b: number | null;
  status: "live" | "upcoming" | "final";
  set_info: string | null;
  team_a_id: number | null;
  team_b_id: number | null;
  court: { name: string };
};

export function parseTeams(data: unknown): RawTeam[] {
  return ((data as TeamRow[]) ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    division: t.division ?? (t.name.endsWith(" Women") ? "Women" : "Men"),
    pool: t.pool,
  }));
}

export function parseMatches(data: unknown): RawMatch[] {
  return ((data as MatchRow[]) ?? []).map((r) => ({
    id: r.id,
    seq: r.seq,
    court: r.court.name,
    matchDate: r.match_date,
    startTime: r.start_time,
    stage: r.stage,
    labelA: r.label_a,
    labelB: r.label_b,
    referee: r.referee,
    scoreA: r.score_a,
    scoreB: r.score_b,
    status: r.status,
    setInfo: r.set_info,
    teamAId: r.team_a_id,
    teamBId: r.team_b_id,
  }));
}

const isPlayed = (g: RawMatch) =>
  g.status === "final" &&
  g.scoreA !== null &&
  g.scoreB !== null &&
  g.teamAId !== null &&
  g.teamBId !== null;

// Head-to-head between teams that are level on points and goal difference
function breakTie(group: StandingRow[], games: RawMatch[]): StandingRow[] {
  const ids = new Set(group.map((r) => r.team.id));
  const h2h = new Map<number, { pts: number; gd: number }>();
  group.forEach((r) => h2h.set(r.team.id, { pts: 0, gd: 0 }));

  for (const g of games) {
    if (!isPlayed(g)) continue;
    const idA = g.teamAId as number;
    const idB = g.teamBId as number;
    if (!ids.has(idA) || !ids.has(idB)) continue;
    const sa = g.scoreA as number;
    const sb = g.scoreB as number;
    const a = h2h.get(idA)!;
    const b = h2h.get(idB)!;
    a.gd += sa - sb;
    b.gd += sb - sa;
    if (sa > sb) a.pts += 3;
    else if (sb > sa) b.pts += 3;
    else {
      a.pts += 1;
      b.pts += 1;
    }
  }

  const sorted = [...group].sort((x, y) => {
    const hx = h2h.get(x.team.id)!;
    const hy = h2h.get(y.team.id)!;
    return hy.pts - hx.pts || hy.gd - hx.gd || x.team.name.localeCompare(y.team.name);
  });

  return sorted.map((r) => {
    const h = h2h.get(r.team.id)!;
    const tied = sorted.some((o) => {
      if (o.team.id === r.team.id) return false;
      const ho = h2h.get(o.team.id)!;
      return ho.pts === h.pts && ho.gd === h.gd;
    });
    return { ...r, tied };
  });
}

// Points, then goal difference, then head-to-head
function sortRows(rows: StandingRow[], games: RawMatch[]): StandingRow[] {
  const base = [...rows].sort((a, b) => b.points - a.points || b.gd - a.gd);
  const out: StandingRow[] = [];
  let i = 0;
  while (i < base.length) {
    let j = i + 1;
    while (
      j < base.length &&
      base[j].points === base[i].points &&
      base[j].gd === base[i].gd
    ) {
      j++;
    }
    const group = base.slice(i, j);
    if (group.length === 1) out.push(group[0]);
    else out.push(...breakTie(group, games));
    i = j;
  }
  return out;
}

export function computeStandings(
  teams: RawTeam[],
  matches: RawMatch[]
): PoolTable[] {
  const tables: PoolTable[] = [];

  for (const division of ["Men", "Women"] as const) {
    const pools = Array.from(
      new Set(
        teams
          .filter((t) => t.division === division && t.pool)
          .map((t) => t.pool as string)
      )
    ).sort();

    for (const pool of pools) {
      const poolTeams = teams.filter(
        (t) => t.division === division && t.pool === pool
      );
      const games = matches.filter(
        (m) => m.stage === `Group ${pool} - ${division}`
      );

      const rows = new Map<number, StandingRow>();
      for (const team of poolTeams) {
        rows.set(team.id, {
          team,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          points: 0,
          pf: 0,
          pa: 0,
          gd: 0,
          tied: false,
        });
      }

      for (const g of games) {
        if (!isPlayed(g)) continue;
        const a = rows.get(g.teamAId as number);
        const b = rows.get(g.teamBId as number);
        if (!a || !b) continue;
        const sa = g.scoreA as number;
        const sb = g.scoreB as number;
        a.played++;
        b.played++;
        a.pf += sa;
        a.pa += sb;
        b.pf += sb;
        b.pa += sa;
        a.gd = a.pf - a.pa;
        b.gd = b.pf - b.pa;
        if (sa > sb) {
          a.won++;
          a.points += 3;
          b.lost++;
        } else if (sb > sa) {
          b.won++;
          b.points += 3;
          a.lost++;
        } else {
          a.drawn++;
          b.drawn++;
          a.points += 1;
          b.points += 1;
        }
      }

      tables.push({
        division,
        pool,
        complete: games.length > 0 && games.every(isPlayed),
        rows: sortRows(Array.from(rows.values()), games),
      });
    }
  }

  return tables;
}

// Fills "Group A 1st", "Winner Cup QF 1" and similar slots with real teams
export function resolveMatches(
  raw: RawMatch[],
  teams: RawTeam[]
): ResolvedMatch[] {
  const byId = new Map(teams.map((t) => [t.id, t]));
  const tables = computeStandings(teams, raw);

  const divisionOf = (m: RawMatch): Division => {
    if (m.stage?.endsWith(" - Women")) return "Women";
    if (m.stage?.endsWith(" - Men")) return "Men";
    const known = m.teamAId ? byId.get(m.teamAId) : undefined;
    return known?.division ?? "Men";
  };

  const stageKey = (m: RawMatch) =>
    (m.stage ?? "").replace(/ - (Men|Women)$/i, "").toLowerCase();

  const resolved: ResolvedMatch[] = [...raw]
    .sort((a, b) => a.seq - b.seq)
    .map((m) => ({
      ...m,
      division: divisionOf(m),
      teamA: m.teamAId ? (byId.get(m.teamAId) ?? null) : null,
      teamB: m.teamBId ? (byId.get(m.teamBId) ?? null) : null,
    }));

  const index = new Map<string, ResolvedMatch>();
  for (const m of resolved) index.set(`${m.division}|${stageKey(m)}`, m);

  const resolveSlot = (label: string, division: Division): RawTeam | null => {
    const group = label.match(/^Group ([A-Za-z]) (\d+)/);
    if (group) {
      const table = tables.find(
        (t) => t.division === division && t.pool === group[1].toUpperCase()
      );
      if (!table || !table.complete) return null;
      return table.rows[Number(group[2]) - 1]?.team ?? null;
    }

    const ref = label.match(/^(Winner|Loser) (.+)$/i);
    if (ref) {
      const source = index.get(`${division}|${ref[2].toLowerCase()}`);
      if (
        !source ||
        source.status !== "final" ||
        source.scoreA === null ||
        source.scoreB === null ||
        source.scoreA === source.scoreB ||
        !source.teamA ||
        !source.teamB
      ) {
        return null;
      }
      const aWon = source.scoreA > source.scoreB;
      const winner = aWon ? source.teamA : source.teamB;
      const loser = aWon ? source.teamB : source.teamA;
      return ref[1].toLowerCase() === "winner" ? winner : loser;
    }

    return null;
  };

  // A few passes, so winners can feed later rounds
  for (let pass = 0; pass < 4; pass++) {
    for (const m of resolved) {
      if (!m.teamA && m.labelA) m.teamA = resolveSlot(m.labelA, m.division);
      if (!m.teamB && m.labelB) m.teamB = resolveSlot(m.labelB, m.division);
    }
  }

  return resolved;
}