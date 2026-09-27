import { createStatsRoute } from "@/lib/subject-routes";
import { scienceStore } from "@/lib/subjects/stores";

export const { GET, POST } = createStatsRoute(scienceStore);
