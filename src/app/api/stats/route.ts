import { createStatsRoute } from "@/lib/subject-routes";
import { mathStore } from "@/lib/subjects/stores";

export const { GET, POST } = createStatsRoute(mathStore);
