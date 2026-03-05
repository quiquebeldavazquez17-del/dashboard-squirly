import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { CompareMode, DateRange, WeekInfo } from "./types";

export function getCurrentWeek(referenceDate: Date = new Date()): WeekInfo {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return {
    start,
    end,
    label: `${format(start, "d", { locale: es })}–${format(end, "d MMM", { locale: es })}`,
  };
}

export function getWeekByOffset(offset: number, referenceDate: Date = new Date()): WeekInfo {
  const ref = addDays(referenceDate, offset * 7);
  return getCurrentWeek(ref);
}

export function getCompareRange(range: DateRange, mode: CompareMode, customRange?: DateRange): DateRange {
  const duration = range.end.getTime() - range.start.getTime();

  switch (mode) {
    case "prev_week":
      return {
        start: subDays(range.start, 7),
        end: subDays(range.end, 7),
      };
    case "prev_month_same_range": {
      const compareStart = subMonths(range.start, 1);
      return {
        start: compareStart,
        end: new Date(compareStart.getTime() + duration),
      };
    }
    case "prev_year_same_range": {
      const compareStart = subYears(range.start, 1);
      return {
        start: compareStart,
        end: new Date(compareStart.getTime() + duration),
      };
    }
    case "custom":
      return customRange || { start: subDays(range.start, 7), end: subDays(range.end, 7) };
    default:
      return { start: subDays(range.start, 7), end: subDays(range.end, 7) };
  }
}

export function formatCompareLabel(mode: CompareMode, compareRange: DateRange): string {
  const labels: Record<CompareMode, string> = {
    prev_week: "Semana anterior",
    prev_month_same_range: "Mismo rango, mes anterior",
    prev_year_same_range: "Mismo rango, año anterior",
    custom: "Personalizado",
  };
  const rangeLabel = `${format(compareRange.start, "d MMM", { locale: es })} – ${format(compareRange.end, "d MMM", { locale: es })}`;
  return `${labels[mode]} (${rangeLabel})`;
}
