import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { MagnifyingGlassIcon, ArrowPathIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Customer = {
  dni: string;
  name: string;
  phone: string;
  locationLine: string;
  shippingCarrier: "SHALOM" | "OLVA";
  shalomAgency: string;
  olvaAddress: string;
  olvaReference: string;
  createdAt: string;
  updatedAt: string;
  totalOrders?: number;
  totalSpent?: number;
};

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmt     = (n: number) => new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);

export default function AdminCustomersPage() {
  const [rows, setRows]       = useState<Customer[]>([]);
  const [q, setQ]             = useState("");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail]   = useState<Customer | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/customers");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((c) =>
      [c.name, c.dni, c.phone, c.locationLine].join(" ").toLowerCase().includes(query)
    );
  }, [rows, q]);

  return (
    <>
      <Head><title>Clientes — Admin Rossy Resina</title></Head>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, DNI, teléfono o ubicación..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amazon_blue"
            />
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-4 border-amazon_blue border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-gray-400">No hay clientes registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Cliente", "DNI", "Teléfono", "Ubicación", "Agencia", "Pedidos", "Gastado", "Última compra", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.dni || c.phone} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #cb299e, #6E2CA1)" }}>
                          {String(c.name || "?")[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{c.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.dni || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{c.locationLine || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        c.shippingCarrier === "OLVA"
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : "bg-sky-100 text-sky-700 border-sky-200"
                      }`}>
                        {c.shippingCarrier === "OLVA" ? "Olva" : "Shalom"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{c.totalOrders ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {c.totalSpent != null ? `S/ ${fmt(c.totalSpent)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(c.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetail(c)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                        title="Ver detalle"
                      >
                        <UserIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {detail && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "linear-gradient(135deg, #cb299e, #6E2CA1)" }}>
                  {String(detail.name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{detail.name}</p>
                  <p className="text-xs text-gray-400">Cliente</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                ["DNI",        detail.dni],
                ["Teléfono",   detail.phone],
                ["Ubicación",  detail.locationLine],
                ["Agencia",    detail.shippingCarrier === "OLVA" ? "Olva Courier" : "Shalom"],
                detail.shippingCarrier === "SHALOM"
                  ? ["Agencia Shalom", detail.shalomAgency]
                  : ["Dirección Olva", detail.olvaAddress],
                detail.shippingCarrier !== "SHALOM" ? ["Referencia Olva", detail.olvaReference] : ["", ""],
                ["Primer contacto", fmtDate(detail.createdAt)],
                ["Última compra",   fmtDate(detail.updatedAt)],
              ].filter(([l]) => l).map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{value || "—"}</p>
                </div>
              ))}
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
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/customers", permanent: false } };
  return { props: {} };
};
