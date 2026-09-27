export interface SaleLimit {
  id: string;
  gameId: string;
  salePointId: string;
  amount: number;
  maxPerTicket: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSaleLimitPayload {
  gameId: string;
  salePointId: string;
  amount: number;
  maxPerTicket?: number | null;
}
