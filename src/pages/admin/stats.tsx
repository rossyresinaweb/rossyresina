import Head from "next/head";
import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ShoppingBagIcon, CurrencyDollarIcon, CheckCircleIcon, CalendarIcon } from "@heroicons/react/24/outline";

const fmt = (n: number) => new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);

export default function AdminStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders-stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = stats?.byYear
    ? Math.max(...stats.byYear.map((r: any) => Number(r.revenue || 0)), 1)
    : 1;

  return (
    <>
      <Head><title>Estadísticas — Admin Rossy Resina</title></Head>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 rounded-full border-4 border-amazon_blue border-t-transparent animate-spin" />
        </div>
      ) : !stats ? (
        <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4">Error al cargar estadísticas.</div>
      ) : (
        <div className="space-y-6">

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total pedidos",       value: stats.totalOrders,        icon: ShoppingBagIcon,    color: "bg-blue-500" },
              { label: "Pedidos finalizados",  value: stats.totalFinalizados,   icon: CheckCircleIcon,    color: "bg-green-500" },
              { label: `Pedidos ${stats.currentYear}`, value: stats.currentYearOrders, icon: CalendarIcon, color: "bg-purple-500" },
              { label: "Facturación total",    value: `S/ ${fmt(stats.totalRevenue)}`, icon: CurrencyDollarIcon, color: "bg-amazon_blue" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center text-white shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico por año */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-bold text-gray-900 mb-5">Facturación por año</p>
            <div className="space-y-3">
              {(stats.byYear || []).map((row: any) => {
                const pct = Math.round((Number(row.revenue || 0) / maxRevenue) * 100);
                return (
                  <div key={row.year} className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600 w-12 shrink-0">{row.year}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg, #cb299e, #6E2CA1)" }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-28 text-right shrink-0">S/ {fmt(Number(row.revenue || 0))}</span>
                    <span className="text-xs text-gray-400 w-20 text-right shrink-0">{row.totalOrders} pedidos</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla detalle */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">Detalle histórico por año</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Año", "Total pedidos", "Finalizados", "Tasa finalización", "Facturación", "Ticket promedio"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(stats.byYear || []).map((row: any) => {
                    const tasa = row.totalOrders > 0 ? Math.round((row.finalizados / row.totalOrders) * 100) : 0;
                    const ticket = row.finalizados > 0 ? Number(row.revenue || 0) / row.finalizados : 0;
                    return (
                      <tr key={row.year} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900">{row.year}</td>
                        <td className="px-4 py-3 text-gray-700">{row.totalOrders}</td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                            {row.finalizados}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${tasa}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{tasa}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">S/ {fmt(Number(row.revenue || 0))}</td>
                        <td className="px-4 py-3 text-gray-600">S/ {fmt(ticket)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">Los pedidos finalizados después de 2 horas se ocultan en la vista activa pero quedan guardados en el historial.</p>
            </div>
          </div>

        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/stats", permanent: false } };
  return { props: {} };
};
