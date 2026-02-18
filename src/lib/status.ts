import { differenceInCalendarDays } from "date-fns";

export function computeStatus(endDate: Date, now = new Date()) {
  const daysLeft = differenceInCalendarDays(endDate, now);
  if (daysLeft < 0) return { status: "EXPIRED" as const, daysLeft };
  if (daysLeft <= 2) return { status: "EXPIRING_SOON" as const, daysLeft };
  return { status: "ACTIVE" as const, daysLeft };
}

export function progressPercent(startDate: Date, endDate: Date, now = new Date()) {
  const total = endDate.getTime() - startDate.getTime();
  if (total <= 0) return 100;
  const elapsed = now.getTime() - startDate.getTime();
  const p = Math.max(0, Math.min(1, elapsed / total));
  return Math.round(p * 100);
}

export function progressColor(pctElapsed: number) {
  // more elapsed => closer to end
  if (pctElapsed < 60) return "green";
  if (pctElapsed < 85) return "yellow";
  return "red";
}
