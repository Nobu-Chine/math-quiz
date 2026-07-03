export function calcRank(score: number, total: number): string {
  if (score === total) return "SS";
  const pct = score / total;
  if (pct >= 0.8) return "S";
  if (pct >= 0.6) return "A";
  if (pct >= 0.4) return "B";
  return "C";
}

export const RANK_COLORS: Record<string, string> = {
  SS: "text-fuchsia-500",
  S: "text-amber-500",
  A: "text-sky-500",
  B: "text-emerald-500",
  C: "text-slate-500",
};
