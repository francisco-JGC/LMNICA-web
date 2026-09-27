import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';

import { SellerQuotasSection } from '@/features/sale-limits-by-seller-number/components/seller-quotas-section';
import { useSalePoints } from '@/features/sale-points/hooks/use-sale-points';
import { Select } from '@/shared/ui/select';

export function SellerQuotasPage() {
  const { data: salePoints = [] } = useSalePoints();
  const [salePointId, setSalePointId] = useState('');

  const selectedSalePoint = useMemo(
    () => salePoints.find((sp) => sp.id === salePointId) ?? null,
    [salePoints, salePointId],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black tracking-tight">
          Cuotas por Vendedor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Asigná topes individuales a cada vendedor por número y juego.
          Seleccioná una sucursal para ver y editar sus cuotas.
        </p>
      </header>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="min-w-52 flex-1">
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Sucursal
          </label>
          <Select
            value={salePointId}
            onChange={setSalePointId}
            placeholder="Seleccioná una sucursal"
            options={salePoints.map((sp) => ({ value: sp.id, label: sp.name }))}
          />
        </div>
      </div>

      {!selectedSalePoint ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Users className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Seleccioná una sucursal para ver sus cuotas.
          </p>
        </div>
      ) : (
        <SellerQuotasSection salePoint={selectedSalePoint} />
      )}
    </div>
  );
}
