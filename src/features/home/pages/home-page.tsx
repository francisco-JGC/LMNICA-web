import {
  CircleDollarSign,
  MapPin,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
} from 'lucide-react';

import { GamesBreakdown } from '@/features/home/components/games-breakdown';
import {
  KpiCard,
  type KpiDelta,
} from '@/features/home/components/kpi-card';
import { MonthlyChart } from '@/features/home/components/monthly-chart';
import { PendingPayoutsCard } from '@/features/home/components/pending-payouts-card';
import { TopRankingCard } from '@/features/home/components/top-ranking-card';
import { useDashboardSummary } from '@/features/home/hooks/use-dashboard-summary';
import { useSession } from '@/features/auth/hooks/use-session';
import { formatCurrency } from '@/shared/lib/format';

export function HomePage() {
  const { data, isLoading, error } = useDashboardSummary();
  const session = useSession();

  return (
    <div className="space-y-6">
      <PageHeader name={session?.user.name ?? ''} />

      {isLoading && <HomeSkeleton />}
      {error && <HomeError message={error.message} />}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <KpiCard
              label="Facturado hoy"
              value={formatCurrency(data.billedToday)}
              icon={CircleDollarSign}
              tone="emerald"
              hint="vs ayer"
              delta={pctDelta(data.billedToday, data.billedYesterday, 'up')}
            />
            <KpiCard
              label="Pérdida hoy"
              value={formatCurrency(data.wonToday)}
              icon={TrendingDown}
              tone="rose"
              hint="Premios ganados hoy"
              delta={pctDelta(data.wonToday, data.wonYesterday, 'down')}
            />
            <KpiCard
              label="Utilidad hoy"
              value={formatCurrency(data.profitToday)}
              icon={TrendingUp}
              tone="indigo"
              hint="Facturado − Pérdida"
              delta={pctDelta(data.profitToday, data.profitYesterday, 'up')}
            />
            <KpiCard
              label="Boletos hoy"
              value={data.ticketsToday.toLocaleString('es')}
              icon={Receipt}
              tone="amber"
              hint={`Ticket promedio ${formatCurrency(data.averageTicketToday)}`}
              delta={pctDelta(data.ticketsToday, data.ticketsYesterday, 'up')}
            />
            <KpiCard
              label="Venta semanal"
              value={formatCurrency(data.weeklyBilled)}
              icon={Sparkles}
              tone="emerald"
              hint="Últimos 7 días vs anteriores"
              delta={pctDelta(
                data.weeklyBilled,
                data.weeklyBilledPrev,
                'up',
              )}
            />
          </div>

          <MonthlyChart data={data.monthlySeries} />

          <GamesBreakdown items={data.byGame} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TopRankingCard
              title="Top vendedores (hoy)"
              emptyLabel="Aún no hay ventas hoy."
              items={data.topSellers}
              icon={UserRound}
              tone="indigo"
            />
            <TopRankingCard
              title="Top puntos de venta (hoy)"
              emptyLabel="Aún no hay ventas hoy."
              items={data.topSalePoints}
              icon={MapPin}
              tone="emerald"
            />
          </div>

          <PendingPayoutsCard data={data.pendingPayouts} />
        </>
      )}
    </div>
  );
}

function pctDelta(
  current: number,
  baseline: number,
  positive: 'up' | 'down',
): KpiDelta {
  if (baseline === 0) {
    // No baseline to compare against: hide the arrow, show "sin dato".
    return { pct: null, positive };
  }
  const pct = ((current - baseline) / Math.abs(baseline)) * 100;
  return { pct, positive };
}

function PageHeader({ name }: { name: string }) {
  const today = new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  const first = name.split(' ')[0];
  const capitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-tight">
          Hola{first ? `, ${first}` : ''} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{capitalized}</p>
      </div>
    </header>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-border/70 bg-card"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl border border-border/70 bg-card" />
      <div className="h-64 animate-pulse rounded-2xl border border-border/70 bg-card" />
    </div>
  );
}

function HomeError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
      No se pudieron cargar los datos del dashboard: {message}
    </div>
  );
}
