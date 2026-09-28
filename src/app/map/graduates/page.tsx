import { GraduatesList } from "@/components/Leaderboard";
import { getGraduates } from "@/lib/leaderboard";
import { MAP_GRADUATES_KEY } from "@/lib/redis";
import { mapTheme } from "@/lib/themes";

export const revalidate = 30;

export default async function MapGraduatesPage() {
  const graduates = await getGraduates(MAP_GRADUATES_KEY);
  return (
    <GraduatesList
      theme={mapTheme}
      graduates={graduates}
      title="🗺️ 卒業生リスト"
      subtitle="ノーミスクリアを3回達成した人たち"
      backHref="/map"
      backLabel="マップクイズにもどる"
    />
  );
}
