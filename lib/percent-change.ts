// Helper: convert range to dates
export function resolveDateRange(range: string, from?: string, to?: string) {
  const now = new Date();

  switch (range) {
    case "today":
      return { gte: new Date(now.setHours(0, 0, 0, 0)), lte: new Date() };
    case "7d":
      return { gte: new Date(Date.now() - 7 * 86400000), lte: new Date() };
    case "30d":
      return { gte: new Date(Date.now() - 30 * 86400000), lte: new Date() };
    case "custom":
      if (from && to) return { gte: new Date(from), lte: new Date(to) };
      break;
  }
  return undefined; // all time
}

// Helper: previous period for change calculation
export function resolvePreviousRange(
  range: string,
  from?: string,
  to?: string,
) {
  const now = new Date();

  switch (range) {
    case "today": {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const prevStart = new Date(start.getTime() - 86400000);
      const prevEnd = new Date(start.getTime() - 1);
      return { gte: prevStart, lte: prevEnd };
    }
    case "7d":
      return {
        gte: new Date(Date.now() - 14 * 86400000),
        lte: new Date(Date.now() - 7 * 86400000),
      };
    case "30d":
      return {
        gte: new Date(Date.now() - 60 * 86400000),
        lte: new Date(Date.now() - 30 * 86400000),
      };
    case "custom":
      if (from && to) {
        const diff = new Date(to).getTime() - new Date(from).getTime();
        return {
          gte: new Date(new Date(from).getTime() - diff),
          lte: new Date(new Date(from).getTime() - 1),
        };
      }
  }
  return undefined;
}

// Helper: percent change
export function percentChange(prev: number, curr: number) {
  if (prev === 0) return "—";
  const pct = ((curr - prev) / prev) * 100;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}
