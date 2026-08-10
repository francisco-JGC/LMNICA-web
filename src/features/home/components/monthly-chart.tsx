import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompact, formatCurrency } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import {
  SegmentedControl,
  type SegmentTab,
} from '@/shared/ui/segmented-control';

import type { MonthlySeriesPoint } from '@/features/home/types';

type Series = 'billed' | 'won' | 'both';

interface SeriesStyle {
  label: string;
  stroke: string;
  gradientId: string;
  badge: string;
  dot: string;
}

const BILLED: SeriesStyle = {
  label: 'Facturado',
  stroke: '#059669',
  gradientId: 'fill-billed',
  badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20',
  dot: 'bg-emerald-500',
};

const WON: SeriesStyle = {
  label: 'Ganado por clientes',
  stroke: '#e11d48',
  gradientId: 'fill-won',
  badge: 'bg-rose-500/10 text-rose-700 ring-rose-500/20',
  dot: 'bg-rose-500',
};

const TABS: readonly SegmentTab<Series>[] = [
  { key: 'billed', label: 'Facturado', tone: 'emerald' },
  { key: 'won', label: 'Ganado', tone: 'rose' },
  { key: 'both', label: 'Ambos' },
] as const;

export function MonthlyChart({ data }: { data: MonthlySeriesPoint[] }) {
  const [series, setSeries] = useState<Series>('billed');

  const totals = useMemo(() => {
    let billed = 0;
    let won = 0;
    for (const point of data) {
      billed += point.billed;
      won += point.won;
    }
    return { billed, won };
  }, [data]);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight">
            Ingresos y egresos mensuales
          </h2>
          <SummaryLine series={series} totals={totals} />
        </div>

        <SegmentedControl
          ariaLabel="Serie del gráfico"
          tabs={TABS}
          value={series}
          onChange={setSeries}
        />
      </header>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={BILLED.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BILLED.stroke} stopOpacity={0.32} />
                <stop offset="100%" stopColor={BILLED.stroke} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={WON.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={WON.stroke} stopOpacity={0.28} />
                <stop offset="100%" stopColor={WON.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={formatCompact}
              width={54}
            />
            <Tooltip
              cursor={{
                stroke: '#94a3b8',
                strokeDasharray: '4 4',
                strokeOpacity: 0.5,
              }}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid rgba(15,23,42,0.08)',
                boxShadow:
                  '0 10px 25px -12px rgba(15,23,42,0.18), 0 1px 2px rgba(15,23,42,0.04)',
                fontSize: 12,
                padding: '8px 10px',
              }}
              labelStyle={{ fontWeight: 700, color: '#0f172a' }}
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0)),
                name === 'billed' ? BILLED.label : WON.label,
              ]}
            />
            {(series === 'billed' || series === 'both') && (
              <Area
                type="monotone"
                dataKey="billed"
                name="billed"
                stroke={BILLED.stroke}
                strokeWidth={2.5}
                fill={`url(#${BILLED.gradientId})`}
                dot={{
                  r: 3,
                  stroke: BILLED.stroke,
                  fill: '#fff',
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            )}
            {(series === 'won' || series === 'both') && (
              <Area
                type="monotone"
                dataKey="won"
                name="won"
                stroke={WON.stroke}
                strokeWidth={2.5}
                fill={`url(#${WON.gradientId})`}
                dot={{
                  r: 3,
                  stroke: WON.stroke,
                  fill: '#fff',
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {series === 'both' && (
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/70 pt-4">
          <LegendDot color={BILLED.dot} label={BILLED.label} />
          <LegendDot color={WON.dot} label={WON.label} />
        </div>
      )}
    </section>
  );
}

function SummaryLine({
  series,
  totals,
}: {
  series: Series;
  totals: { billed: number; won: number };
}) {
  if (series === 'both') {
    const net = totals.billed - totals.won;
    return (
      <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
        <TotalChip label={BILLED.label} value={totals.billed} style={BILLED} />
        <TotalChip label={WON.label} value={totals.won} style={WON} />
        <span className="text-xs text-muted-foreground">
          Neto:{' '}
          <span className="font-semibold text-foreground">
            {formatCurrency(net)}
          </span>
        </span>
      </div>
    );
  }
  const style = series === 'billed' ? BILLED : WON;
  const value = series === 'billed' ? totals.billed : totals.won;
  return (
    <div className="mt-1.5 flex items-baseline gap-2">
      <span className="text-2xl font-black tracking-tight">
        {formatCurrency(value)}
      </span>
      <span
        className={cn(
          'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset',
          style.badge,
        )}
      >
        {style.label} · 7 meses
      </span>
    </div>
  );
}

function TotalChip({
  label,
  value,
  style,
}: {
  label: string;
  value: number;
  style: SeriesStyle;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={cn('inline-block size-2 rounded-full', style.dot)} />
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-black tracking-tight">
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={cn('size-2.5 rounded-full', color)} />
      <span className="font-medium text-foreground">{label}</span>
    </div>
  );
}

