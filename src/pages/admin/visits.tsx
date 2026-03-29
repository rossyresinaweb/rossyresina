import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { ArrowPathIcon, ArrowDownTrayIcon, ShieldExclamationIcon, GlobeAltIcon, UsersIcon, EyeIcon } from "@heroicons/react/24/outline";

type WindowPreset = "24h" | "7d" | "30d" | "90d" | "365d" | "all";

const WINDOWS: Array<{ value: WindowPreset; label: string }> = [
  { value: "24h",  label: "24 horas" },
  { value: "7d",   label: "7 días" },
  { value: "30d",  label: "30 días" },
  { value: "90d",  label: "90 días" },
  { value: "365d", label: "365 días" },
  { value: "all",  label: "Todo" },
];

const fmtDate = (v: string) => v ? new Date(v).toLocaleString("es-PE") : "—";

export default function AdminVisitsPage() {
  const [window, setWindow]           = useState<WindowPreset>("30d");
  const [stats, setStats]             = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [myIp, setMyIp]               = useState("");
  const [excludedIps, setExcludedIps] = useState<Array<{ ip: string; note: string; createdAt: string }>>([]);
  const [ipLoading, setIpLoading]     = useState(false);
  const [ipMsg, setIpMsg]             = useState("");
  const [showIpPanel, setShowIpPanel] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch(`/api/admin/visits?window=${window}`);
      if (!r.ok) throw new Error(`Error ${r.status}`);
      setStats(await r.json());
    } catch (e: any) { setError(e.message || "Error"); setStats(null); }
    finally { setLoading(false); }
  }, [window]);

  const loadIps = useCallback(async () => {
    setIpLoading(true);
    try {
      const r = await fetch("/api/admin/visit-exclusions");
      const b = await r.json();
      setMyIp(String(b?.myIp || ""));
      setExcludedIps(Array.isArray(b?.items) ? b.items : []);
    } catch {} finally { setIpLoading(false); }
  }, []);

  useEffect(() => { load(); loadIps(); }, [load, loadIps]);

  const excludeIp = async () => {
    if (!myIp) return;
    setIpLoading(true);
    try {
      await fetch("/api/admin/visit-exclusions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ip: myIp, note: "IP administradora" }) });
      await loadIps(); setIpMsg(`IP ${myIp} excluida correctamente.`);
    } catch { setIpMsg("No se pudo excluir la IP."); } finally { setIpLoading(false); }
  };

  const removeIp = async (ip: string) => {
    setIpLoading(true);
    try {
      await fetch(`/api/admin/visit-exclusions?ip=${encodeURIComponent(ip)}`, { method: "DELETE" });
      await loadIps();
    } catch {} finally { setIpLoading(false); }
  };

  const maxSeries = useMemo(() =>
    Math.max(1, ...(stats?.series || []).map((r: any) => Number(r.visits || 0))), [stats]);

  return (
    <>
      <Head><title>Visitas — Admin Rossy Resina</title></Head>

      {/* Controles */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {WINDOWS.map((w) => (
              <button
                key={w.value}
                onClick={() => setWindow(w.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  window === w.value ? "bg-amazon_blue text-white border-amazon_blue" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <a href={`/api/admin/visits?window=${window}&format=csv`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-200 text-sm text-green-700 hover:bg-green-50 transition">
              <ArrowDownTrayIcon className="w-4 h-4" />
              CSV
            </a>
            <button onClick={() => setShowIpPanel((v) => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
              <ShieldExclamationIcon className="w-4 h-4" />
              IPs excluidas
            </button>
          </div>
        </div>
      </div>

      {/* Panel IPs */}
      {showIpPanel && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <p className="text-sm font-bold text-gray-900 mb-3">Gestión de IPs excluidas</p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <p className="text-xs text-gray-500">Tu IP: <span className="font-semibold text-gray-800">{myIp || "No detectada"}</span></p>
            <button onClick={excludeIp} disabled={!myIp || ipLoading} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              Excluir mi IP
            </button>
          </div>
          {ipMsg && <p className="text-xs text-green-600 mb-3">{ipMsg}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["IP", "Nota", "Fecha", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {excludedIps.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-xs text-gray-400 text-center">No hay IPs excluidas.</td></tr>
                ) : excludedIps.map((row) => (
                  <tr key={row.ip} className="hover:bg-gray-50/60">
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{row.ip}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{row.note || "—"}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{fmtDate(row.createdAt)}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => removeIp(row.ip)} disabled={ipLoading} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50">
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 rounded-full border-4 border-amazon_blue border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700">Reintentar</button>
        </div>
      ) : !stats ? (
        <div className="text-center py-20 text-sm text-gray-400">Aún no hay datos de visitas.</div>
      ) : (
        <div className="space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total visitas",        value: stats.overview?.totalVisits,          icon: EyeIcon,      color: "bg-blue-500" },
              { label: "Visitantes únicos",    value: stats.overview?.uniqueVisitors,       icon: UsersIcon,    color: "bg-purple-500" },
              { label: "Usuarios registrados", value: stats.overview?.registeredUserVisits, icon: UsersIcon,    color: "bg-green-500" },
              { label: "Promedio por visitante", value: Number(stats.overview?.avgVisitsPerVisitor || 0).toFixed(1), icon: GlobeAltIcon, color: "bg-amazon_blue" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center text-white shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico tendencia */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">Tendencia de visitas</p>
              <p className="text-xs text-gray-400">{stats.window?.label}</p>
            </div>
            {stats.series?.length > 0 ? (
              <div className="space-y-2">
                {stats.series.map((row: any) => {
                  const visits = Number(row.visits || 0);
                  const pct    = Math.max(2, Math.round((visits / maxSeries) * 100));
                  return (
                    <div key={row.period} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24 shrink-0">{row.period}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #cb299e, #6E2CA1)" }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-10 text-right shrink-0">{visits}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No hay datos para esta ventana.</p>
            )}
          </div>

          {/* Tablas */}
          <div className="grid lg:grid-cols-2 gap-5">
            {[
              { title: "Páginas más visitadas", data: stats.topPages,   cols: ["Ruta", "Visitas"],  keys: ["path", "visits"] },
              { title: "Visitas por país",       data: stats.byCountry,  cols: ["País", "Visitas"],  keys: ["country", "visits"] },
              { title: "Visitas por ciudad",     data: stats.byCity,     cols: ["Ciudad", "Visitas"], keys: ["city", "visits"] },
              { title: "Usuarios más activos",   data: stats.topUsers,   cols: ["Usuario", "Email", "Visitas", "Última visita"], keys: ["name", "email", "count", "lastSeenAt"] },
            ].map(({ title, data, cols, keys }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{cols.map((c) => <th key={c} className="text-left text-xs font-semibold text-gray-400 px-4 py-2">{c}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(Array.isArray(data) ? data : []).slice(0, 10).map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                          {keys.map((k) => (
                            <td key={k} className="px-4 py-2 text-xs text-gray-700 max-w-[180px] truncate">
                              {k === "lastSeenAt" ? fmtDate(row[k]) : (row[k] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {(!data || data.length === 0) && (
                        <tr><td colSpan={cols.length} className="px-4 py-4 text-xs text-gray-400 text-center">Sin datos.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/visits", permanent: false } };
  return { props: {} };
};
