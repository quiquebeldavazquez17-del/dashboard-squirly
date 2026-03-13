import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Settings, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeView, CompareMode, WeekInfo, DateRange as BusinessDateRange } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "react-router-dom";
import { DateRange } from "react-day-picker";

interface DashboardHeaderProps {
  timeView: TimeView;
  onTimeViewChange: (view: TimeView) => void;
  week: WeekInfo;
  onWeekChange: (direction: -1 | 1) => void;
  compareMode: CompareMode;
  onCompareModeChange: (mode: CompareMode) => void;
  compareLabel: string;
  customRange?: BusinessDateRange;
  onCustomRangeChange: (range: BusinessDateRange) => void;
}

const timeViews: { value: TimeView; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

const compareModes: { value: CompareMode; label: string }[] = [
  { value: "prev_week", label: "Sem. anterior" },
  { value: "prev_month_same_range", label: "Mes anterior" },
  { value: "prev_year_same_range", label: "Año anterior" },
  { value: "custom", label: "Personalizado" },
];

export function DashboardHeader({
  timeView,
  onTimeViewChange,
  week,
  onWeekChange,
  compareMode,
  onCompareModeChange,
  compareLabel,
  customRange,
  onCustomRangeChange,
}: DashboardHeaderProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(
    customRange ? { from: customRange.start, to: customRange.end } : undefined,
  );

  useEffect(() => {
    if (customRange) {
      setCalendarRange({ from: customRange.start, to: customRange.end });
    }
  }, [customRange]);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img
                src="/squirly-logo.png"
                alt="Squirly logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">KPI'S SQUIRLY</h1>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time view tabs */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {timeViews.map((tv) => (
              <button
                key={tv.value}
                onClick={() => onTimeViewChange(tv.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeView === tv.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tv.label}
              </button>
            ))}
          </div>

          {/* Range selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <button onClick={() => onWeekChange(-1)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-medium text-foreground min-w-[150px] text-center">
              {week.label}
            </span>
            <button onClick={() => onWeekChange(1)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>


          {/* Compare mode */}
          <div className="flex items-center gap-2">
            <select
              value={compareMode}
              onChange={(e) => onCompareModeChange(e.target.value as CompareMode)}
              className="bg-muted text-xs text-muted-foreground rounded-lg px-3 py-2 border-0 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {compareModes.map((cm) => (
                <option key={cm.value} value={cm.value}>
                  {cm.label}
                </option>
              ))}
            </select>
            {compareMode === "custom" && (
              <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs font-medium"
                  >
                    <CalendarRange className="w-4 h-4" />
                    Seleccionar rango
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={calendarRange}
                    onSelect={(range) => {
                      setCalendarRange(range as DateRange | undefined);
                    }}
                  />
                  <div className="flex justify-end gap-2 border-t border-border px-3 py-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => {
                        setCalendarRange(
                          customRange
                            ? { from: customRange.start, to: customRange.end }
                            : undefined,
                        );
                        setIsCustomOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs"
                      disabled={!calendarRange?.from || !calendarRange?.to}
                      onClick={() => {
                        if (!calendarRange?.from || !calendarRange?.to) return;
                        onCustomRangeChange({
                          start: calendarRange.from,
                          end: calendarRange.to,
                        });
                        setIsCustomOpen(false);
                      }}
                    >
                      Aplicar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Compare label */}
          <span className="text-xs text-muted-foreground hidden md:inline">
            Comparando: {compareLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
