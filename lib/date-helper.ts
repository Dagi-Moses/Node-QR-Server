export default function resolveDateRange(
  range: string,
  from?: string,
  to?: string,
) {
  const now = new Date();

  if (range === "today") {
    return { gte: new Date(now.setHours(0, 0, 0, 0)), lte: new Date() };
  }

  if (range === "7d") {
    return { gte: new Date(Date.now() - 7 * 86400000), lte: new Date() };
  }

  if (range === "30d") {
    return { gte: new Date(Date.now() - 30 * 86400000), lte: new Date() };
  }

  if (range === "custom" && from && to) {
    return { gte: new Date(from), lte: new Date(to) };
  }

  return undefined; // all time
}
