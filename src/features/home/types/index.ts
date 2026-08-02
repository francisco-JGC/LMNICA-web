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
  billedToday: number;
  paidToday: number;
  /** Premios ganados por tickets vendidos hoy (pagados o no) — "pérdida". */
  wonToday: number;
  profitToday: number;
  ticketsToday: number;
  averageTicketToday: number;

  billedYesterday: number;
  paidYesterday: number;
  wonYesterday: number;
  profitYesterday: number;
  ticketsYesterday: number;

  weeklyBilled: number;
  weeklyBilledPrev: number;

  totalUsers: number;

  monthlySeries: MonthlySeriesPoint[];
  byGame: GameBreakdownItem[];
  pendingPayouts: PendingPayouts;
  topSellers: RankingItem[];
  topSalePoints: RankingItem[];
}
