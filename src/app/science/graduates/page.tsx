import { GraduatesList } from "@/components/Leaderboard";
import { getGraduates } from "@/lib/leaderboard";
import { SCIENCE_GRADUATES_KEY } from "@/lib/redis";
import { scienceTheme } from "@/lib/themes";

export const revalidate = 30;

export default async function ScienceGraduatesPage() {
  const graduates = await getGraduates(SCIENCE_GRADUATES_KEY);
  return (
    <GraduatesList
      theme={scienceTheme}
      graduates={graduates}
      subtitle="全単元クリア + 総合テスト合格者"
      backHref="/science"
      backLabel="理科クイズにもどる"
    />
  );
}
