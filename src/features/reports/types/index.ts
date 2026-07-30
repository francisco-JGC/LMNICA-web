export interface SellerReportRow {
  sellerId: string;
  sellerName: string;
  ticketCount: number;
  voidedCount: number;
  paidCount: number;
  billed: number;
  /** Ya pagado (informacional). */
  paidPrize: number;
  /**
   * Total ganado por los tickets del vendedor esté pagado o no.
   * "Lo que debería entregar" en la UI.
   */
  wonPrize: number;
  paymentPercentage: number | null;
  /** `billed × paymentPercentage / 100` rounded — null when % not set. */
  salary: number | null;
}

export interface SellerReportParams {
  salePointId?: string;
  sellerId?: string;
  /** ISO with Managua offset (`-06:00`). Inclusive. */
  from?: string;
  /** ISO with Managua offset. Inclusive. */
  to?: string;
}

export interface SellerReportResponse {
  items: SellerReportRow[];
}

export interface BranchTotalsRow {
  salePointId: string;
  salePointName: string;
  ownerPartnerId: string | null;
  ownerPartnerName: string | null;
  ticketCount: number;
  voidedCount: number;
  paidCount: number;
  billed: number;
  paidPrize: number;
  /** `billed - paidPrize` — revenue after payouts. Can be negative. */
  net: number;
}

export interface BranchTotalsParams {
  gameId?: string;
  from?: string;
  to?: string;
}

export interface BranchTotalsResponse {
  items: BranchTotalsRow[];
}

export interface BillingByGameRow {
  gameId: string;
  gameName: string;
  ticketCount: number;
  voidedCount: number;
  paidCount: number;
  billed: number;
  paidPrize: number;
  net: number;
  /** 0..1 — `billed / totalBilled`. */
  share: number;
}

export interface BillingByGameParams {
  salePointId?: string;
  sellerId?: string;
  from?: string;
  to?: string;
}

export interface BillingByGameResponse {
  items: BillingByGameRow[];
}
