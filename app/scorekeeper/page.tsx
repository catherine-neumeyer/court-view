"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

type Status = "upcoming" | "live" | "final";
type Row = {
  id: number;
  score_a: number | null;
  score_b: number | null;
  status: Status;
  label_a: string | null;
  label_b: string | null;
  court: { name: string };
  team_a: { name: string } | null;
  team_b: { name: string } | null;
};
type Snapshot = { score_a: number | null; score_b: number | null; status: Status };

const nameA = (r: Row) => r.team_a?.name ?? r.label_a ?? "TBC";
const nameB = (r: Row) => r.team_b?.name ?? r.label_b ?? "TBC";

export default function ScorekeeperPage() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);

  // Track who is signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s)
    );
    return () => data.subscription.unsubscribe();
  }, []);

  // Show sign-in link errors from the address bar, if any
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search + "&" + window.location.hash.slice(1)
    );
    const err = params.get("error_description");
    if (err) setMessage(err);
  }, []);

  async function loadMatches() {
    const { data } = await supabase
      .from("matches")
      .select(
        `id, score_a, score_b, status, label_a, label_b,
         court:courts(name),
         team_a:teams!team_a_id(name),
         team_b:teams!team_b_id(name)`
      )
      .neq("status", "final")
      .order("seq");
    const list = (data as unknown as Row[]) ?? [];
    setRows(list);
    setSelectedId((cur) =>
      list.some((r) => r.id === cur) ? cur : (list[0]?.id ?? null)
    );
  }

  // Once signed in, check for a staff row and load matches
  useEffect(() => {
    if (!session) {
      setIsStaff(false);
      return;
    }
    supabase
      .from("staff")
      .select("role")
      .maybeSingle()
      .then(({ data }) => {
        setIsStaff(!!data);
        if (data) loadMatches();
      });
  }, [session]);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/scorekeeper`,
      },
    });
    setMessage(error ? error.message : "Check your email for the sign-in link.");
  }

  async function signInWithPassword() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setMessage(error ? error.message : "");
  }

  const match = rows.find((r) => r.id === selectedId) ?? null;

  async function save(patch: Partial<Snapshot>, recordHistory = true) {
    if (!match) return;
    const before: Snapshot = {
      score_a: match.score_a,
      score_b: match.score_b,
      status: match.status,
    };
    setRows((rs) => rs.map((r) => (r.id === match.id ? { ...r, ...patch } : r)));
    const { error } = await supabase
      .from("matches")
      .update(patch)
      .eq("id", match.id);
    if (error) {
      setMessage(error.message);
      loadMatches();
      return;
    }
    setMessage("");
    if (recordHistory) setHistory((h) => [...h, before]);
  }

  function bump(side: "score_a" | "score_b", delta: number) {
    if (!match || match.status !== "live") return;
    save({ [side]: Math.max(0, (match[side] ?? 0) + delta) });
  }

  async function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    await save(last, false);
  }

  async function finish() {
    if (!match || !window.confirm("Finish this match?")) return;
    await save({ status: "final" });
    setHistory([]);
    loadMatches();
  }

  const shell = "w-full";

  if (!ready) {
    return (
      <main className={shell}>
        <p className="p-4">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={shell}>
        <header className="bg-stone-900 px-5 pb-3 pt-5 text-white">
          <h1 className="text-2xl font-bold">Staff sign in</h1>
        </header>
        <form onSubmit={sendLink} className="flex flex-col gap-3 p-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-4"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-4"
          />
          <button
            type="button"
            onClick={signInWithPassword}
            className="min-h-14 rounded-2xl bg-blue-700 text-lg font-bold text-white"
          >
            Sign in
          </button>
          <button className="min-h-14 rounded-2xl border border-stone-300 bg-white text-lg font-bold">
            Email me a sign-in link
          </button>
          {message && <p className="text-sm text-stone-600">{message}</p>}
        </form>
      </main>
    );
  }

  if (!isStaff) {
    return (
      <main className={shell}>
        <div className="flex flex-col gap-3 p-4">
          <p>This account does not have staff access.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="min-h-12 rounded-xl border border-stone-300 bg-white font-semibold"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={shell}>
      <header className="bg-stone-900 px-5 pb-3 pt-5 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Scorekeeper</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm underline"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 p-4">
        {rows.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-stone-600">
            No matches left to score.
          </p>
        ) : (
          <select
            value={selectedId ?? ""}
            onChange={(e) => {
              setSelectedId(Number(e.target.value));
              setHistory([]);
            }}
            className="min-h-12 rounded-xl border border-stone-300 bg-white px-3"
          >
            {rows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.court.name}: {nameA(r)} vs {nameB(r)} ({r.status})
              </option>
            ))}
          </select>
        )}

        {match && (
          <>
            {(
              [
                ["score_a", nameA(match)],
                ["score_b", nameB(match)],
              ] as const
            ).map(([side, name]) => (
              <section
                key={side}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{name}</span>
                  <span className="text-6xl font-extrabold tabular-nums">
                    {match[side] ?? "-"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => bump(side, -1)}
                    disabled={match.status !== "live"}
                    aria-label={`${name} minus one`}
                    className="min-h-18 flex-1 rounded-2xl bg-stone-200 text-3xl font-extrabold disabled:opacity-40"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => bump(side, 1)}
                    disabled={match.status !== "live"}
                    aria-label={`${name} plus one`}
                    className="min-h-18 flex-1 rounded-2xl bg-blue-700 text-3xl font-extrabold text-white disabled:opacity-40"
                  >
                    +1
                  </button>
                </div>
              </section>
            ))}

            {match.status === "upcoming" && (
              <button
                onClick={() =>
                  save({
                    status: "live",
                    score_a: match.score_a ?? 0,
                    score_b: match.score_b ?? 0,
                  })
                }
                className="min-h-14 rounded-2xl bg-blue-700 text-lg font-bold text-white"
              >
                Start match
              </button>
            )}
            {match.status === "live" && (
              <button
                onClick={finish}
                className="min-h-14 rounded-2xl bg-blue-700 text-lg font-bold text-white"
              >
                Finish match
              </button>
            )}
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="min-h-14 rounded-2xl border border-stone-300 bg-white text-lg font-bold disabled:opacity-40"
            >
              Undo
            </button>
            {message && <p className="text-sm text-red-700">{message}</p>}
          </>
        )}
      </div>
    </main>
  );
}