export interface SalePoint {
  id: string;
  name: string;
  code: string;
  /** Encargado de la sucursal — user with role=partner, 1 per sucursal. */
  ownerPartnerId: string | null;
  /**
   * Socios asignados: additional partners (N per sucursal) that get
   * read-only visibility on this sucursal (dashboards, reports).
   */
  assignedPartnerIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalePointPayload {
  name: string;
  code: string;
  ownerPartnerId?: string;
}

export interface UpdateSalePointPayload {
  name?: string;
  code?: string;
  ownerPartnerId?: string | null;
}

export interface SetAssignedPartnersPayload {
  partnerIds: string[];
}
