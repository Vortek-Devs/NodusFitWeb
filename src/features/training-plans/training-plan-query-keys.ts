export const trainingPlanQueryKeys = {
  all: ["training-plans"] as const,
  lists: () => ["training-plans", "list"] as const,
  list: (studentId: string, page: number) =>
    ["training-plans", "list", studentId, page] as const,
  details: () => ["training-plans", "detail"] as const,
  detail: (planId: string) => ["training-plans", "detail", planId] as const,
  mutations: () => ["training-plans", "mutation"] as const,
};
