export type TimeView = "today" | "week" | "month";

export type CompareMode = "prev_week" | "prev_month_same_range" | "prev_year_same_range" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface KPIValue {
  current_value: number;
  compare_value: number;
  delta_abs: number;
  delta_pct: number;
  label: string;
  unit?: string;
  prefix?: string;
  format?: "number" | "currency" | "percent" | "hours";
  sparkline?: number[];
  description?: string;
  category: "proyecto" | "mercado" | "producto" | "ventas" | "operaciones";
}

export interface WeekInfo {
  start: Date;
  end: Date;
  label: string;
}

export interface SyncRun {
  id: string;
  source: string;
  status: "success" | "error" | "running";
  started_at: string;
  finished_at?: string;
  records_synced: number;
}

export interface BusinessSettings {
  coste_hora: number;
  costes_fijos: number;
  porcentaje_coste_variable: number;
  cogs_global: number;
  lead_definition: "new_customer" | "checkout_session";
  facturacion_tipo: "mrr" | "ingresos";
  target_cliente: string;
}
