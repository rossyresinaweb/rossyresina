import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";
import { createPortal } from "react-dom";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface Product {
  _id: number | string;
  code?: string;
  barcode?: string;
  stock?: number;
  measure?: string;
  priceBulk12?: number;
  priceBulk3?: number;
  title: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  isNew: boolean;
  oldPrice?: number;
  price: number;
}

interface DeleteTarget { id: number | string; code?: string; title: string; }

const fmt = (n: number) => new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);

const normalizeImg = (img: string) => {
  const s = String(img || "");
  const u = s.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(u)) return u;
  return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png";
};

const stockBadge = (stock: number) => {
  if (stock === 0)  return { label: "Agotado",   cls: "bg-red-100 text-red-600 border-red-200" };
  if (stock < 5)    return { label: `${stock} ud.`, cls: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  return              { label: `${stock} ud.`, cls: "bg-green-100 text-green-700 border-green-200" };
};

export default function AdminProducts() {
  const [items, setItems]               = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [deletingKey, setDeletingKey]   = useState("");
  const [confirmTarget, setConfirmTarget] = useState<DeleteTarget | null>(null);
  const [notice, setNotice]             = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mounted, setMounted]           = useState(false);

  const load = async () => {
    setLoading(true);
    const res  = await fetch("/api/products");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); setMounted(true); }, []);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(t);
  }, [notice]);

  const remove = async (id: number | string, code?: string) => {
    const token = String(code || id || "").trim();
    if (!token) { setNotice({ type: "error", text: "No se pudo identificar el producto." }); return; }
    setDeletingKey(token);
    try {
      const qs = new URLSearchParams();
      const safeId   = String(id ?? "").trim();
      const safeCode = String(code ?? "").trim();
      if (safeId && safeId !== "undefined") qs.set("_id", safeId);
      if (safeCode) qs.set("code", safeCode);
      const res = await fetch(`/api/products?${qs}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setNotice({ type: "error", text: String(body?.error || "No se pudo eliminar") });
        return;
      }
      await load();
      setNotice({ type: "success", text: "Producto eliminado correctamente." });
    } finally { setDeletingKey(""); setConfirmTarget(null); }
  };

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(items.map((p) => p.category).filter(Boolean)))], [items]);

  const filtered = useMemo(() => {
    let list = categoryFilter === "Todas" ? items : items.filter((p) => p.category === categoryFilter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) =>
      [p.title, p.code || "", p.barcode || "", p.category, p.brand, p.description].join(" ").toLowerCase().includes(q)
    );
    return list;
  }, [items, query, categoryFilter]);

  const lowStockCount = useMemo(() => items.filter((p) => Number(p.stock || 0) < 5).length, [items]);

  return (
    <>
      {/* Toast */}
      {mounted && notice && createPortal(
        <div className="fixed right-6 top-20 z-[90] animate-fadeInDown">
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${
            notice.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} className="text-xs font-bold opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs text-gray-400">{items.length} productos en total</p>
          {lowStockCount > 0 && (
            <p className="flex items-center gap-1 text-xs text-yellow-600 mt-0.5">
              <ExclamationTriangleIcon className="w-3.5 h-3.5" />
              {lowStockCount} producto(s) con stock bajo
            </p>
          )}
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #cb299e, #6E2CA1)" }}
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código, categoría o marca..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amazon_blue"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amazon_blue bg-white"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            {categoryFilter !== "Todas" && <span className="ml-1 text-gray-400">· {categoryFilter}</span>}
          </p>
          <FunnelIcon className="w-4 h-4 text-gray-300" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-4 border-amazon_blue border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-gray-400">No se encontraron productos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Producto", "Código", "Categoría / Marca", "Precio", "Stock", "Acciones"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const stock = Number(p.stock || 0);
                  const badge = stockBadge(stock);
                  const key   = String(p.code || p._id);
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Producto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                            <Image
                              src={normalizeImg(p.image)}
                              alt={p.title}
                              width={48} height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[200px]">{p.title}</p>
                            {p.isNew && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">NUEVO</span>}
                            {p.oldPrice && Number(p.oldPrice) > p.price && (
                              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-600">OFERTA</span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Código */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-gray-500">{p.code || "—"}</p>
                        {p.barcode && <p className="font-mono text-[10px] text-gray-400">{p.barcode}</p>}
                      </td>
                      {/* Categoría / Marca */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-700">{p.category}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </td>
                      {/* Precio */}
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">S/ {fmt(p.price)}</p>
                        {p.oldPrice && Number(p.oldPrice) > p.price && (
                          <p className="text-xs text-gray-400 line-through">S/ {fmt(Number(p.oldPrice))}</p>
                        )}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/edit/${encodeURIComponent(key)}`}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                            title="Editar"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setConfirmTarget({ id: p._id, code: p.code, title: p.title })}
                            disabled={deletingKey === key}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal confirmar eliminación */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4" onClick={(e) => e.target === e.currentTarget && setConfirmTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
              <p className="font-bold text-gray-900">Confirmar eliminación</p>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Vas a eliminar <strong className="text-gray-800">{confirmTarget.title}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmTarget(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                onClick={() => remove(confirmTarget.id, confirmTarget.code)}
                disabled={deletingKey === String(confirmTarget.code || confirmTarget.id)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {deletingKey === String(confirmTarget.code || confirmTarget.id) ? "Eliminando..." : "Sí, eliminar"}
              </button>
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
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin", permanent: false } };
  return { props: {} };
};
