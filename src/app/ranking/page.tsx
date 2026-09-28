import { StreakRanking } from "@/components/Leaderboard";
import { getStreakRanking } from "@/lib/leaderboard";
import { STREAK_BEST_KEY } from "@/lib/redis";
import { mathTheme } from "@/lib/themes";

export const revalidate = 30;

export default async function RankingPage() {
  const ranking = await getStreakRanking(STREAK_BEST_KEY);
  return <StreakRanking theme={mathTheme} ranking={ranking} backHref="/" backLabel="トップへもどる" />;
}
