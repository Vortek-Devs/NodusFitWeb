import { isCalendarDate, isTimestamp } from "@/lib/contracts/students";

const calendarFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});
const timestampFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatNodusDate(value: string): string {
  const dateOnly = isCalendarDate(value);
  if (!dateOnly && !isTimestamp(value)) return "Data indisponível";
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return (dateOnly ? calendarFormatter : timestampFormatter)
    .formatToParts(date)
    .map((part) => (part.type === "year" ? part.value.padStart(4, "0") : part.value))
    .join("");
}
