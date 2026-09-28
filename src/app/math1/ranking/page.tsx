import { StreakRanking } from "@/components/Leaderboard";
import { getStreakRanking } from "@/lib/leaderboard";
import { MATH1_STREAK_BEST_KEY } from "@/lib/redis";
import { math1Theme } from "@/lib/themes";

export const revalidate = 30;

export default async function Math1RankingPage() {
  const ranking = await getStreakRanking(MATH1_STREAK_BEST_KEY);
  return <StreakRanking theme={math1Theme} ranking={ranking} backHref="/math1" backLabel="数学クイズにもどる" />;
}
