import { createProgressRoute } from "@/lib/subject-routes";
import { scienceStore } from "@/lib/subjects/stores";

export const { GET, POST } = createProgressRoute(scienceStore);
