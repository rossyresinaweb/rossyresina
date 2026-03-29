import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

type DashboardData = {
  kpis: {
    todayOrders: number;
    todayRevenue: number;
    monthOrders: number;
    monthRevenue: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
    growth: number;
  };
  salesChart: { month: string; revenue: number }[];
  lowStock: { id: string; title: string; stock: number; price: number }[];
  latestOrders: { id: string; customerName: string; total: number; status: string; createdAt: string }[];
};

const statusColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-700",
  confirmado: "bg-blue-100 text-blue-700",
  "en proceso de envío": "bg-purple-100 text-purple-700",
  enviado: "bg-indigo-100 text-indigo-700",
  finalizado: "bg-green-100 text-green-700",
};

const getStatusColor = (status: string) => {
  const key = status.toLowerCase();
  for (const [k, v] of Object.entries(statusColor)) {
    if (key.includes(k)) return v;
  }
  return "bg-gray-100 text-gray-600";
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = data ? Math.max(...data.salesChart.map((s) => s.revenue), 1) : 1;

  return (
    <>
      <Head><title>Dashboard — Admin Rossy Resina</title></Head>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-4 border-amazon_blue border-t-transparent animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg p-4">Error al cargar el dashboard.</div>
      ) : (
        <div className="space-y-6">

          {/* KPIs principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Ventas hoy"
              value={`S/ ${fmt(data.kpis.todayRevenue)}`}
              sub={`${data.kpis.todayOrders} pedido(s)`}
              icon={<CurrencyDollarIcon className="w-5 h-5" />}
              color="bg-green-500"
            />
            <KpiCard
              label="Ventas este mes"
              value={`S/ ${fmt(data.kpis.monthRevenue)}`}
              sub={
                <span className={`flex items-center gap-1 text-xs font-medium ${data.kpis.growth >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {data.kpis.growth >= 0
                    ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                    : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
                  {data.kpis.growth >= 0 ? "+" : ""}{data.kpis.growth}% vs mes anterior
                </span>
              }
              icon={<ShoppingBagIcon className="w-5 h-5" />}
              color="bg-amazon_blue"
            />
            <KpiCard
              label="Pedidos pendientes"
              value={String(data.kpis.pendingOrders)}
              sub={<Link href="/admin/orders" className="text-xs text-amazon_blue hover:underline">Ver pedidos →</Link>}
              icon={<ClockIcon className="w-5 h-5" />}
              color="bg-yellow-500"
            />
            <KpiCard
              label="Facturación total"
              value={`S/ ${fmt(data.kpis.totalRevenue)}`}
              sub={`${data.kpis.totalCustomers} clientes`}
              icon={<UsersIcon className="w-5 h-5" />}
              color="bg-purple-500"
            />
          </div>

          {/* KPIs secundarios */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.kpis.totalProducts}</p>
                <p className="text-xs text-gray-500">Productos activos</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.kpis.totalCustomers}</p>
                <p className="text-xs text-gray-500">Clientes únicos</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.kpis.monthOrders}</p>
                <p className="text-xs text-gray-500">Pedidos este mes</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.lowStock.length}</p>
                <p className="text-xs text-gray-500">Stock bajo (&lt;5 unid.)</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Gráfico de ventas */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-bold text-gray-900">Ventas últimos 6 meses</p>
                  <p className="text-xs text-gray-400">Facturación en soles</p>
                </div>
                <Link href="/admin/stats" className="text-xs text-amazon_blue hover:underline font-medium">Ver estadísticas →</Link>
              </div>
              <div className="flex items-end gap-3 h-40">
                {data.salesChart.map((s) => {
                  const pct = Math.round((s.revenue / maxRevenue) * 100);
                  return (
                    <div key={s.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        S/{fmt(s.revenue)}
                      </span>
                      <div className="w-full rounded-t-md bg-amazon_blue/10 relative overflow-hidden" style={{ height: "120px" }}>
                        <div
                          className="absolute bottom-0 w-full bg-amazon_blue rounded-t-md transition-all duration-700"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">{s.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stock bajo */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-900">Stock bajo</p>
                <Link href="/admin" className="text-xs text-amazon_blue hover:underline font-medium">Ver productos →</Link>
              </div>
              {data.lowStock.length === 0 ? (
                <p className="text-xs text-gray-400 mt-2">Todos los productos tienen stock suficiente.</p>
              ) : (
                <div className="space-y-3">
                  {data.lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{p.title}</p>
                        <p className="text-[11px] text-gray-400">S/ {fmt(p.price)}</p>
                      </div>
                      <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.stock === 0 ? "Agotado" : `${p.stock} ud.`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Últimos pedidos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">Últimos pedidos</p>
              <Link href="/admin/orders" className="text-xs text-amazon_blue hover:underline font-medium">Ver todos →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">ID Pedido</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Total</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Estado</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2">Hace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.latestOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-gray-800 max-w-[160px] truncate">{o.customerName}</td>
                      <td className="py-2.5 pr-4 text-xs text-gray-400 font-mono">{o.id.slice(0, 8)}…</td>
                      <td className="py-2.5 pr-4 font-semibold text-gray-900">S/ {fmt(o.total)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-gray-400">{timeAgo(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </>
  );
}

function KpiCard({ label, value, sub, icon, color }: {
  label: string;
  value: string;
  sub: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center text-white shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight truncate">{value}</p>
        <div className="mt-0.5">{typeof sub === "string" ? <p className="text-xs text-gray-400">{sub}</p> : sub}</div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/dashboard", permanent: false } };
  return { props: {} };
};
