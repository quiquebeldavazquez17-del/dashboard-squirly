import { Target } from "lucide-react";

export function BreakEvenCard() {
  const costesFijos = 4200;
  const margenContribucion = 0.65;
  const breakEvenMensual = costesFijos / margenContribucion;
  const breakEvenSemanal = breakEvenMensual / 4;

  return (
    <div className="kpi-card">
      <h3 className="section-title">Break-Even Analysis</h3>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Target Cliente</p>
            <p className="text-sm text-foreground mt-0.5">SaaS B2B, 10-50 empleados, facturación &gt;500K€</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Break-even mensual</p>
              <p className="text-xl font-bold text-foreground">€{breakEvenMensual.toLocaleString("es-ES", { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Break-even semanal</p>
              <p className="text-xl font-bold text-foreground">€{breakEvenSemanal.toLocaleString("es-ES", { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>Costes fijos: €{costesFijos.toLocaleString()}</div>
            <div>Margen contribución: {(margenContribucion * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
