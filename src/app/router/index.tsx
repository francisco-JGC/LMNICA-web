import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { AdminShell } from '@/app/layout/admin-shell';
import { ProtectedRoute } from '@/app/router/protected-route';
import { RoleGate } from '@/app/router/role-gate';
import { LoginPage } from '@/features/auth/pages/login-page';
import { UserRole } from '@/features/auth/types';
import { HomePage } from '@/features/home/pages/home-page';
import { APP_ROUTES } from '@/shared/constants/routes';

/**
 * Feature pages are code-split so the initial bundle stays small — the
 * shell, auth, and home ship eagerly; everything else downloads on demand
 * when the user navigates to it for the first time.
 *
 * LoginPage and HomePage stay eager because they're the entry points every
 * user hits — lazy-loading them just delays the first paint.
 */
const LatestResultsPage = lazy(() =>
  import('@/features/draw-results/pages/latest-results-page').then((m) => ({
    default: m.LatestResultsPage,
  })),
);
const DrawsPage = lazy(() =>
  import('@/features/games/pages/draws-page').then((m) => ({
    default: m.DrawsPage,
  })),
);
const BranchFlowPage = lazy(() =>
  import('@/features/movements/pages/branch-flow-page').then((m) => ({
    default: m.BranchFlowPage,
  })),
);
const ExpensesPage = lazy(() =>
  import('@/features/movements/pages/expenses-page').then((m) => ({
    default: m.ExpensesPage,
  })),
);
const MovementsBalancePage = lazy(() =>
  import('@/features/movements/pages/movements-balance-page').then((m) => ({
    default: m.MovementsBalancePage,
  })),
);
const MovementsPage = lazy(() =>
  import('@/features/movements/pages/movements-page').then((m) => ({
    default: m.MovementsPage,
  })),
);
const BillingPage = lazy(() =>
  import('@/features/reports/pages/billing-page').then((m) => ({
    default: m.BillingPage,
  })),
);
const BranchTotalsPage = lazy(() =>
  import('@/features/reports/pages/branch-totals-page').then((m) => ({
    default: m.BranchTotalsPage,
  })),
);
const SellerReportPage = lazy(() =>
  import('@/features/reports/pages/seller-report-page').then((m) => ({
    default: m.SellerReportPage,
  })),
);
const SaleLimitsPage = lazy(() =>
  import('@/features/sale-limits/pages/sale-limits-page').then((m) => ({
    default: m.SaleLimitsPage,
  })),
);
const SucursalConfigPage = lazy(() =>
  import('@/features/sale-points/pages/sucursal-config-page').then((m) => ({
    default: m.SucursalConfigPage,
  })),
);
const SucursalesPage = lazy(() =>
  import('@/features/sale-points/pages/sucursales-page').then((m) => ({
    default: m.SucursalesPage,
  })),
);
const SystemConfigPage = lazy(() =>
  import('@/features/feature-flags/pages/system-config-page').then((m) => ({
    default: m.SystemConfigPage,
  })),
);
const SalesPage = lazy(() =>
  import('@/features/tickets/pages/sales-page').then((m) => ({
    default: m.SalesPage,
  })),
);
const UsersPage = lazy(() =>
  import('@/features/users/pages/users-page').then((m) => ({
    default: m.UsersPage,
  })),
);
const WinnersPage = lazy(() =>
  import('@/features/winners/pages/winners-page').then((m) => ({
    default: m.WinnersPage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: APP_ROUTES.login,
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGate allow={[UserRole.ADMIN, UserRole.PARTNER]} />,
        children: [
          {
            element: <AdminShell />,
            children: [
              {
                path: APP_ROUTES.root,
                element: <Navigate to={APP_ROUTES.home} replace />,
              },
              { path: APP_ROUTES.home, element: <HomePage /> },
              { path: APP_ROUTES.sales, element: <SalesPage /> },
              { path: APP_ROUTES.branchTotals, element: <BranchTotalsPage /> },
              { path: APP_ROUTES.sellerReport, element: <SellerReportPage /> },
              { path: APP_ROUTES.branchFlowReport, element: <BranchFlowPage /> },
              { path: APP_ROUTES.billing, element: <BillingPage /> },
              { path: APP_ROUTES.winners, element: <WinnersPage /> },
              { path: APP_ROUTES.expenses, element: <ExpensesPage /> },
              { path: APP_ROUTES.movements, element: <MovementsPage /> },
              { path: APP_ROUTES.movementsCalc, element: <MovementsBalancePage /> },
              { path: APP_ROUTES.users, element: <UsersPage /> },
              { path: APP_ROUTES.sucursales, element: <SucursalesPage /> },
              { path: APP_ROUTES.sucursalConfig, element: <SucursalConfigPage /> },
              { path: APP_ROUTES.draws, element: <DrawsPage /> },
              { path: APP_ROUTES.saleLimits, element: <SaleLimitsPage /> },
              { path: APP_ROUTES.latestResults, element: <LatestResultsPage /> },
              { path: APP_ROUTES.systemConfig, element: <SystemConfigPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={APP_ROUTES.home} replace /> },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
