export interface MonthlySeriesPoint {
  monthStart: string;
  label: string;
  billed: number;
  paid: number;
}

export interface GameBreakdownItem {
  gameId: string;
  gameName: string;
  billed: number;
  paid: number;
}

export interface PendingPayoutPreview {
  ticketId: string;
  folio: string;
  gameId: string;
  gameName: string;
  drawAt: string;
  totalPrize: number;
  client: string | null;
}

export interface PendingPayouts {
  count: number;
  totalAmount: number;
  items: PendingPayoutPreview[];
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
  paid: number;
  /** Premios ganados en el rango (pagados o no) — "pérdida". */
  won: number;
  /** Utilidad real: `billed − won − salaries`. */
  profit: number;
  /**
   * Salarios totales del rango: comisiones de vendedores sobre sus
   * ventas + comisiones de encargados sobre las ventas de sus sucursales.
   */
  salaries: number;
  tickets: number;
  averageTicket: number;

  // Ventana equivalente inmediata anterior, para deltas.
  billedPrev: number;
  paidPrev: number;
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
  pendingPayouts: PendingPayouts;
  topSellers: RankingItem[];
  topSalePoints: RankingItem[];
}

export interface DashboardSummaryParams {
  /** ISO 8601 con offset — inicio del rango, inclusivo. */
  from?: string;
  /** ISO 8601 con offset — fin del rango, inclusivo. */
  to?: string;
}
