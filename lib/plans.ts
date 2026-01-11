export function getPriceFromPlanType(planType: string): number | null {
  switch (planType) {
    case "week":
      return 100;
    case "month":
      return 300;
    case "year":
      return 3000;
    default:
      return null;
  }
}
