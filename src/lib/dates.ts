// Event dates are plain YYYY-MM-DD strings interpreted in Nigerian time.

import { siteConfig } from "~/config";

export type EventState = "upcoming" | "live" | "past";

/** Today's date in Lagos as YYYY-MM-DD. */
export function lagosToday(now = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: siteConfig.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function eventState(startDate: string, endDate: string, today = lagosToday()): EventState {
  if (today < startDate) return "upcoming";
  if (today > endDate) return "past";
  return "live";
}

// Noon UTC keeps a date-only string on the same calendar day in any zone.
const asDate = (iso: string) => new Date(`${iso}T12:00:00Z`);

const longDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dayDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "6 November 2026" */
export const formatDate = (iso: string) => longDate.format(asDate(iso));

/** "Friday 6 November" */
export const formatDay = (iso: string) => dayDate.format(asDate(iso)).replace(",", "");

/** "6–7 November 2026", or a single date when start and end match. */
export const formatDateRange = (start: string, end: string) =>
  start === end ? formatDate(start) : longDate.formatRange(asDate(start), asDate(end));
