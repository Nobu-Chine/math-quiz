import { GraduatesList } from "@/components/Leaderboard";
import { getGraduates } from "@/lib/leaderboard";
import { MATH1_GRADUATES_KEY } from "@/lib/redis";
import { math1Theme } from "@/lib/themes";

export const revalidate = 30;

export default async function Math1GraduatesPage() {
  const graduates = await getGraduates(MATH1_GRADUATES_KEY);
  return (
    <GraduatesList
      theme={math1Theme}
      graduates={graduates}
      subtitle="全単元クリア + 総合テスト合格者"
      backHref="/math1"
      backLabel="数学クイズにもどる"
    />
  );
}
