import { createStatsRoute } from "@/lib/subject-routes";
import { math1Store } from "@/lib/subjects/stores";

export const { GET, POST } = createStatsRoute(math1Store);
