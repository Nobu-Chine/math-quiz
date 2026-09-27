import { createProgressRoute } from "@/lib/subject-routes";
import { math1Store } from "@/lib/subjects/stores";

export const { GET, POST } = createProgressRoute(math1Store);
