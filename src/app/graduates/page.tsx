import { GraduatesList } from "@/components/Leaderboard";
import { getGraduates } from "@/lib/leaderboard";
import { GRADUATES_KEY } from "@/lib/redis";
import { mathTheme } from "@/lib/themes";

export const revalidate = 30;

export default async function GraduatesPage() {
  const graduates = await getGraduates(GRADUATES_KEY);
  return (
    <GraduatesList
      theme={mathTheme}
      graduates={graduates}
      subtitle="全カテゴリクリア + 卒業テスト合格者"
      backHref="/"
      backLabel="トップへもどる"
    />
  );
}
