import { createProgressRoute } from "@/lib/subject-routes";
import { mathStore } from "@/lib/subjects/stores";

export const { GET, POST } = createProgressRoute(mathStore);
