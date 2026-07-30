import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Calendar,
  Handshake,
  MapPin,
  TrendingDown,
  TrendingUp,
  User,
  UserSearch,
} from 'lucide-react';

import { useMovementsBalance } from '@/features/movements/hooks/use-movements-balance';
import { useSellerReport } from '@/features/reports/hooks/use-seller-report';
import { useSalePoints } from '@/features/sale-points/hooks/use-sale-points';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '@/shared/lib/format';
import { Select } from '@/shared/ui/select';

import type { MovementsBalanceRow } from '@/features/movements/types';
import type { SellerReportRow } from '@/features/reports/types';

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Cálculo de movimientos rediseñado a **cards**. Dos modos:
 *
 * - **Sin vendedor seleccionado** → un card por sucursal con billed,
 *   premios adeudados (wonPrize), premios ya pagados, movements, y el
 *   `net` grande resaltado en verde/rojo.
 * - **Con vendedor seleccionado** → un card por vendedor con lo que
 *   vendió, pagó, debería pagar (wonPrize), su salario según % (con
 *   checkbox para ocultar), y el net del vendedor.
 *
 * En móvil los cards hacen scroll horizontal (flex-nowrap + overflow-x)
 * para revisar sucursal por sucursal sin abrir una vista distinta.
 */
export function MovementsBalancePage() {
  const [salePointId, setSalePointId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [from, setFrom] = useState(isoDate(new Date()));
  const [to, setTo] = useState(isoDate(new Date()));
  const [showSalary, setShowSalary] = useState(true);

  const rangeParams = useMemo(
    () => ({
      salePointId: salePointId || undefined,
      from: from ? `${from}T00:00:00-06:00` : undefined,
      to: to ? `${to}T23:59:59-06:00` : undefined,
    }),
    [salePointId, from, to],
  );

  const balanceQuery = useMovementsBalance(rangeParams);
  // No pasamos `sellerId` a la query — traemos TODOS los vendedores en
  // scope (respetando sucursal + partner scope + rango) y filtramos
  // localmente. Con esto el dropdown se puebla con la misma fuente,
  // evitando el bug donde `useUsers` con partner scoping (por
  // `createdById`) devolvía lista vacía si los sellers fueron creados
  // por un admin y no por el partner logueado.
  const sellerQuery = useSellerReport(rangeParams);

  const { data: salePoints } = useSalePoints();

  const balanceRows = balanceQuery.data?.items ?? [];
  const allSellerRows = sellerQuery.data?.items ?? [];
  const sellerRows = sellerId
    ? allSellerRows.filter((s) => s.sellerId === sellerId)
    : allSellerRows;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-muted-foreground" />
          <h1 className="text-2xl font-black tracking-tight">
            Cálculo de Movimientos
          </h1>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          El <span className="font-semibold">restante</span> descuenta los
          premios ganadores del rango, estén pagados o no — la ganancia real
          esperada aunque los boletos ganadores aún no se hayan cobrado.
        </p>
      </header>

      <FiltersBar
        salePointId={salePointId}
        onSalePointChange={setSalePointId}
        salePoints={salePoints ?? []}
        sellerId={sellerId}
        onSellerChange={setSellerId}
        sellers={allSellerRows.map((r) => ({
          id: r.sellerId,
          name: r.sellerName,
        }))}
        from={from}
        onFromChange={setFrom}
        to={to}
        onToChange={setTo}
        showSalary={showSalary}
        onShowSalaryChange={setShowSalary}
      />

      <section className="space-y-3">
        <SectionHeader
          icon={<User className="size-4" />}
          title="Vendedores"
          hint={
            sellerId
              ? '1 vendedor filtrado'
              : `${sellerRows.length} vendedor${sellerRows.length === 1 ? '' : 'es'}`
          }
        />
        {sellerQuery.error ? (
          <ErrorBox message={sellerQuery.error.message} />
        ) : (
          <SellerCards
            rows={sellerRows}
            loading={sellerQuery.isLoading}
            showSalary={showSalary}
          />
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={<MapPin className="size-4" />}
          title="Sucursales"
          hint={
            salePointId
              ? '1 sucursal filtrada'
              : `${balanceRows.length} sucursal${balanceRows.length === 1 ? '' : 'es'}`
          }
        />
        {balanceQuery.error ? (
          <ErrorBox message={balanceQuery.error.message} />
        ) : (
          <BranchCards
            rows={balanceRows}
            loading={balanceQuery.isLoading}
          />
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
        {title}
      </h2>
      <span className="text-[11px] text-muted-foreground">· {hint}</span>
    </div>
  );
}

function FiltersBar({
  salePointId,
  onSalePointChange,
  salePoints,
  sellerId,
  onSellerChange,
  sellers,
  from,
  onFromChange,
  to,
  onToChange,
  showSalary,
  onShowSalaryChange,
}: {
  salePointId: string;
  onSalePointChange: (v: string) => void;
  salePoints: { id: string; name: string }[];
  sellerId: string;
  onSellerChange: (v: string) => void;
  sellers: { id: string; name: string }[];
  from: string;
  onFromChange: (v: string) => void;
  to: string;
  onToChange: (v: string) => void;
  showSalary: boolean;
  onShowSalaryChange: (v: boolean) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Sucursal">
          <Select
            value={salePointId}
            onChange={onSalePointChange}
            leadingIcon={<MapPin className="size-4" />}
            placeholder="Todas"
            options={[
              { value: '', label: 'Todas las sucursales' },
              ...salePoints.map((sp) => ({ value: sp.id, label: sp.name })),
            ]}
          />
        </Field>
        <Field label="Vendedor">
          <Select
            value={sellerId}
            onChange={onSellerChange}
            leadingIcon={<UserSearch className="size-4" />}
            placeholder="Todos"
            options={[
              { value: '', label: 'Todos los vendedores' },
              ...sellers.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
        </Field>
        <Field label="Desde">
          <DateField value={from} max={to} onChange={onFromChange} />
        </Field>
        <Field label="Hasta">
          <DateField value={to} min={from} onChange={onToChange} />
        </Field>
      </div>
      <label className="flex items-center gap-2 pt-1 text-sm text-foreground">
        <input
          type="checkbox"
          checked={showSalary}
          onChange={(e) => onShowSalaryChange(e.target.checked)}
          className="size-4 rounded border-border"
        />
        Mostrar salario del vendedor (ventas × % de pago)
      </label>
    </div>
  );
}

/**
 * Contenedor de cards responsivo:
 * - Móvil (< sm): flex row con overflow-x, cada card con min-width fijo.
 * - Desktop: grid de 2/3/4 columnas según tamaño de viewport.
 */
function CardsScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 sm:mx-0">
      <div
        className={cn(
          'flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:pb-0',
          'sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:px-0',
          'lg:grid-cols-3 xl:grid-cols-4',
        )}
      >
        {children}
      </div>
    </div>
  );
}

function BranchCards({
  rows,
  loading,
}: {
  rows: MovementsBalanceRow[];
  loading: boolean;
}) {
  if (loading && rows.length === 0) {
    return (
      <CardsScroller>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </CardsScroller>
    );
  }
  if (rows.length === 0) {
    return <EmptyBox message="Sin movimientos ni ventas en este rango." />;
  }
  return (
    <CardsScroller>
      {rows.map((row) => (
        <BranchCard key={row.salePointId} row={row} />
      ))}
    </CardsScroller>
  );
}

function BranchCard({ row }: { row: MovementsBalanceRow }) {
  const isPositive = row.net >= 0;
  return (
    <article
      className={cn(
        'flex min-w-[280px] flex-none snap-start flex-col rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:min-w-0 sm:flex-auto',
        isPositive ? 'border-emerald-200/60' : 'border-rose-200/60',
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <MapPin className="size-4" strokeWidth={2.4} />
            </span>
            <h3 className="truncate text-sm font-bold text-foreground">
              {row.salePointName}
            </h3>
          </div>
          {row.ownerPartnerName && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Handshake className="size-3 text-indigo-600" />
              {row.ownerPartnerName}
            </div>
          )}
        </div>
      </header>

      <NetBanner value={row.net} />

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Stat label="Facturado" value={row.billed} tone="emerald" />
        <Stat
          label="Premios a pagar"
          value={row.wonPrize}
          tone="rose"
          hint={
            row.wonPrize > row.paidPrize
              ? `Pendiente por pagar: ${formatCurrency(row.wonPrize - row.paidPrize)}`
              : row.paidPrize > 0
                ? `Ya pagado: ${formatCurrency(row.paidPrize)}`
                : undefined
          }
        />
        <Stat label="Depósitos" value={row.deposits} tone="emerald" />
        <Stat label="Retiros" value={row.withdrawals} tone="rose" />
        <Stat
          label="Gastos"
          value={row.expenses}
          tone="rose"
          className="col-span-2"
        />
      </dl>
    </article>
  );
}

function SellerCards({
  rows,
  loading,
  showSalary,
}: {
  rows: SellerReportRow[];
  loading: boolean;
  showSalary: boolean;
}) {
  if (loading && rows.length === 0) {
    return (
      <CardsScroller>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </CardsScroller>
    );
  }
  if (rows.length === 0) {
    return <EmptyBox message="Sin ventas del vendedor en este rango." />;
  }
  return (
    <CardsScroller>
      {rows.map((row) => (
        <SellerCard key={row.sellerId} row={row} showSalary={showSalary} />
      ))}
    </CardsScroller>
  );
}

function SellerCard({
  row,
  showSalary,
}: {
  row: SellerReportRow;
  showSalary: boolean;
}) {
  // Ganancia neta del vendedor = ventas - premios que debería entregar
  // (independiente de los movements, que son a nivel sucursal).
  const net = row.billed - row.wonPrize;
  const isPositive = net >= 0;
  return (
    <article
      className={cn(
        'flex min-w-[280px] flex-none snap-start flex-col rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:min-w-0 sm:flex-auto',
        isPositive ? 'border-emerald-200/60' : 'border-rose-200/60',
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <User className="size-4" strokeWidth={2.4} />
            </span>
            <h3 className="truncate text-sm font-bold text-foreground">
              {row.sellerName}
            </h3>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {row.ticketCount} ticket{row.ticketCount === 1 ? '' : 's'}
            {row.voidedCount > 0 && ` · ${row.voidedCount} anulado(s)`}
          </div>
        </div>
      </header>

      <NetBanner value={net} />

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Stat label="Vendido" value={row.billed} tone="emerald" />
        <Stat
          label="Premios a pagar"
          value={row.wonPrize}
          tone="rose"
          hint={
            row.wonPrize > row.paidPrize
              ? `Pendiente por pagar: ${formatCurrency(row.wonPrize - row.paidPrize)}`
              : undefined
          }
        />
        <Stat
          label="Pagado a ganadores"
          value={row.paidPrize}
          tone="neutral"
          className={showSalary ? undefined : 'col-span-2'}
        />
        {showSalary && (
          <Stat
            label={
              row.paymentPercentage !== null
                ? `Salario (${row.paymentPercentage}%)`
                : 'Salario'
            }
            value={row.salary ?? 0}
            tone="indigo"
            hint={
              row.paymentPercentage === null
                ? 'Sin % configurado'
                : undefined
            }
          />
        )}
      </dl>
    </article>
  );
}

function NetBanner({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-between rounded-xl px-3 py-2.5 ring-1 ring-inset',
        isPositive
          ? 'bg-emerald-50 ring-emerald-500/25'
          : 'bg-rose-50 ring-rose-500/25',
      )}
    >
      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="size-4 text-emerald-700" strokeWidth={2.4} />
        ) : (
          <TrendingDown className="size-4 text-rose-700" strokeWidth={2.4} />
        )}
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider',
            isPositive ? 'text-emerald-700' : 'text-rose-700',
          )}
        >
          Restante
        </span>
      </div>
      <span
        className={cn(
          'text-xl font-black tabular-nums',
          isPositive ? 'text-emerald-800' : 'text-rose-800',
        )}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  hint,
  className,
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'rose' | 'indigo' | 'neutral';
  hint?: string;
  className?: string;
}) {
  const toneClass = {
    emerald: 'text-emerald-700',
    rose: 'text-rose-700',
    indigo: 'text-indigo-700',
    neutral: 'text-foreground',
  }[tone];
  const Icon =
    tone === 'emerald'
      ? ArrowUpRight
      : tone === 'rose'
        ? ArrowDownRight
        : null;
  return (
    <div
      className={cn(
        'rounded-lg border border-border/60 bg-background/60 p-2.5',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        {Icon && (
          <Icon className={cn('size-3', toneClass)} strokeWidth={2.4} />
        )}
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className={cn('mt-0.5 text-base font-bold tabular-nums', toneClass)}>
        {formatCurrency(value)}
      </div>
      {hint && (
        <div className="mt-0.5 text-[10px] text-muted-foreground/80">
          {hint}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="min-w-[280px] flex-none animate-pulse rounded-2xl border border-border bg-card p-4 sm:min-w-0 sm:flex-auto">
      <div className="h-6 w-2/3 rounded bg-muted" />
      <div className="mt-4 h-12 rounded-xl bg-muted" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

function EmptyBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-14 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      No se pudo cargar el reporte: {message}
    </div>
  );
}

function DateField({
  value,
  min,
  max,
  onChange,
}: {
  value: string;
  min?: string;
  max?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, 'pl-9')}
      />
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
