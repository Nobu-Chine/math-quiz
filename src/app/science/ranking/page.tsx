import { StreakRanking } from "@/components/Leaderboard";
import { getStreakRanking } from "@/lib/leaderboard";
import { SCIENCE_STREAK_BEST_KEY } from "@/lib/redis";
import { scienceTheme } from "@/lib/themes";

export const revalidate = 30;

export default async function ScienceRankingPage() {
  const ranking = await getStreakRanking(SCIENCE_STREAK_BEST_KEY);
  return <StreakRanking theme={scienceTheme} ranking={ranking} backHref="/science" backLabel="理科クイズにもどる" />;
}
