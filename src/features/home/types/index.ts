export interface MonthlySeriesPoint {
  monthStart: string;
  label: string;
  billed: number;
  won: number;
}

export interface GameBreakdownItem {
  gameId: string;
  gameName: string;
  billed: number;
  won: number;
}

export interface RecentWinnerPreview {
  ticketId: string;
  folio: string;
  gameId: string;
  gameName: string;
  drawAt: string;
  totalPrize: number;
  client: string | null;
}

export interface RecentWinners {
  count: number;
  totalAmount: number;
  items: RecentWinnerPreview[];
}

export interface RankingItem {
  id: string;
  name: string;
  amount: number;
  ticketCount: number;
}

export interface DashboardSummary {
  // KPIs del rango solicitado (default = hoy).
  billed: number;
  /** Premios ganados en el rango — "pérdida". */
  won: number;
  /** Utilidad real: `billed − won − salaries`. */
  profit: number;
  /**
   * Salarios totales del rango: comisiones de encargados sobre las
   * ventas de sus sucursales.
   */
  salaries: number;
  tickets: number;
  averageTicket: number;

  // Ventana equivalente inmediata anterior, para deltas.
  billedPrev: number;
  wonPrev: number;
  profitPrev: number;
  salariesPrev: number;
  ticketsPrev: number;

  // Semanal fijo — no depende del rango.
  weeklyBilled: number;
  weeklyBilledPrev: number;

  totalUsers: number;

  monthlySeries: MonthlySeriesPoint[];
  byGame: GameBreakdownItem[];
  /**
   * Ganadores recientes de los últimos 30 días (no filtrados por el rango
   * del dashboard). Antes se llamaba `pendingPayouts` y solo mostraba
   * unpaid — el concepto de "pagado" fue eliminado del sistema.
   */
  recentWinners: RecentWinners;
  topSellers: RankingItem[];
  topSalePoints: RankingItem[];
}

export interface DashboardSummaryParams {
  /** ISO 8601 con offset — inicio del rango, inclusivo. */
  from?: string;
  /** ISO 8601 con offset — fin del rango, inclusivo. */
  to?: string;
}
