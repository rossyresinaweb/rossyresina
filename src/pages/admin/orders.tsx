import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  ChatBubbleLeftEllipsisIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Order = {
  id: string;
  orderCode?: string;
  createdAt?: string;
  date: string;
  status: string;
  total: number;
  paymentMethod?: "YAPE" | "TRANSFER";
  paymentMethodLabel?: string;
  shippingCarrier?: "SHALOM" | "OLVA";
  shippingCarrierLabel?: string;
  shalomVoucherImage?: string;
  shalomPickupCode?: string;
  olvaTrackingImage?: string;
  items: any[];
  customer: {
    name: string;
    email: string;
    phone: string;
    dni?: string;
    locationLine?: string;
    district: string;
    address: string;
    reference?: string;
    shalomAgency?: string;
    notes?: string;
  };
  paymentImage?: string;
};

const STATUS_OPTIONS = [
  "Pendiente por confirmar",
  "Confirmado",
  "En proceso de envío",
  "Enviado",
  "Finalizado",
];

const STATUS_STYLE: Record<string, string> = {
  "pendiente por confirmar": "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmado:               "bg-blue-100 text-blue-700 border-blue-200",
  "en proceso de envío":    "bg-purple-100 text-purple-700 border-purple-200",
  enviado:                  "bg-indigo-100 text-indigo-700 border-indigo-200",
  finalizado:               "bg-green-100 text-green-700 border-green-200",
};

const getStatusStyle = (s: string) => {
  const key = s.toLowerCase();
  for (const [k, v] of Object.entries(STATUS_STYLE)) if (key.includes(k)) return v;
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [shipData, setShipData]       = useState<Record<string, { shalomVoucherImage: string; shalomPickupCode: string; olvaTrackingImage: string }>>({});
  const [loading, setLoading]         = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [search, setSearch]           = useState("");
  const [includeHistory, setIncludeHistory] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [shipModalOrder, setShipModalOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/orders${includeHistory ? "?includeHistory=1" : ""}`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setOrders(rows);
      setShipData((prev) => {
        const next = { ...prev };
        rows.forEach((o: Order) => {
          const ex = next[o.id] || { shalomVoucherImage: "", shalomPickupCode: "", olvaTrackingImage: "" };
          next[o.id] = {
            shalomVoucherImage: ex.shalomVoucherImage || String(o.shalomVoucherImage || ""),
            shalomPickupCode:   ex.shalomPickupCode   || String(o.shalomPickupCode   || ""),
            olvaTrackingImage:  ex.olvaTrackingImage  || String(o.olvaTrackingImage  || ""),
          };
        });
        return next;
      });
    } catch { setOrders([]); }
    finally  { setLoading(false); }
  }, [includeHistory]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const setShipField = (id: string, key: "shalomVoucherImage" | "shalomPickupCode" | "olvaTrackingImage", val: string) =>
    setShipData((prev) => ({ ...prev, [id]: { shalomVoucherImage: "", shalomPickupCode: "", olvaTrackingImage: "", ...prev[id], [key]: val } }));

  const uploadImage = async (file: File) => {
    const reader  = new FileReader();
    const dataUrl = await new Promise<string>((res, rej) => {
      reader.onload  = () => res(String(reader.result || ""));
      reader.onerror = () => rej(new Error("No se pudo leer la imagen"));
      reader.readAsDataURL(file);
    });
    const r    = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, data: dataUrl }) });
    const body = await r.json().catch(() => ({}));
    if (!r.ok || !body?.url) throw new Error(body?.error || "No se pudo subir la imagen");
    return String(body.url);
  };

  const handleShipImage = async (id: string, key: "shalomVoucherImage" | "olvaTrackingImage", file?: File | null) => {
    if (!file) return;
    try { setShipField(id, key, await uploadImage(file)); }
    catch (e: any) { alert(e?.message || "No se pudo subir la imagen"); }
  };

  const updateStatus = async (order: Order, status: string, opts?: { notify?: boolean; closeModal?: boolean }) => {
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        shalomVoucherImage: shipData[order.id]?.shalomVoucherImage || "",
        shalomPickupCode:   shipData[order.id]?.shalomPickupCode   || "",
        olvaTrackingImage:  shipData[order.id]?.olvaTrackingImage  || "",
      }),
    });
    const updated = await res.json().catch(() => null);
    if (!res.ok) { alert(updated?.error || "No se pudo actualizar el pedido"); return; }
    if (updated && opts?.notify) notifyByWhatsApp(updated as Order, status);
    if (opts?.closeModal) setShipModalOrder(null);
    loadOrders();
  };

  const normalizePhone = (raw: string) => {
    const d = String(raw || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.startsWith("51")) return d;
    if (d.length === 9) return `51${d}`;
    return d;
  };

  const notifyByWhatsApp = (order: Order, nextStatus?: string) => {
    const phone = normalizePhone(order?.customer?.phone || "");
    if (!phone) return;
    const statusVerb = (s: string) => {
      const l = s.toLowerCase();
      if (l.includes("confirmado")) return "fue confirmado";
      if (l.includes("proceso"))   return "está en preparación";
      if (l.includes("enviado"))   return "fue enviado";
      if (l.includes("finalizado")) return "fue finalizado";
      return "fue actualizado";
    };
    const code    = order.orderCode || order.id;
    const carrier = order.shippingCarrier === "OLVA" ? "Olva Courier" : "Shalom";
    const sd      = shipData[order.id];
    const msg = [
      `Hola ${order.customer?.name || ""},`,
      `tu pedido ${code} ${statusVerb(nextStatus || order.status)}.`,
      `Estado: ${nextStatus || order.status}.`,
      `Agencia: ${carrier}.`,
      ...(order.shippingCarrier === "SHALOM"
        ? [sd?.shalomPickupCode ? `Clave Shalom: ${sd.shalomPickupCode}` : "", sd?.shalomVoucherImage ? `Voucher: ${sd.shalomVoucherImage}` : ""]
        : [sd?.olvaTrackingImage ? `Tracking Olva: ${sd.olvaTrackingImage}` : ""]),
      "Gracias por comprar en Rossy Resina.",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filtered = useMemo(() => {
    let list = statusFilter === "Todos" ? orders : orders.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        [o.customer?.name, o.customer?.email, o.customer?.phone, o.orderCode, o.id]
          .join(" ").toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  // Contadores por estado para las pestañas
  const countByStatus = useMemo(() => {
    const map: Record<string, number> = { Todos: orders.length };
    STATUS_OPTIONS.forEach((s) => { map[s] = orders.filter((o) => o.status === s).length; });
    return map;
  }, [orders]);

  return (
    <>
      <Head><title>Pedidos — Admin Rossy Resina</title></Head>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, email, teléfono o código..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amazon_blue"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={includeHistory} onChange={(e) => setIncludeHistory(e.target.checked)} className="rounded" />
            Historial completo
          </label>
          <button onClick={loadOrders} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {/* Pestañas de estado */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {["Todos", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                statusFilter === s
                  ? "bg-amazon_blue text-white border-amazon_blue"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {s} <span className="ml-1 opacity-70">({countByStatus[s] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`bg-white rounded-xl border p-3 text-left hover:shadow-sm transition cursor-pointer ${statusFilter === s ? "border-amazon_blue" : "border-gray-200"}`}
          >
            <p className="text-xl font-bold text-gray-900">{countByStatus[s] || 0}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{s}</p>
            <span className={`mt-1 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${getStatusStyle(s)}`}>
              {s.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
            {statusFilter !== "Todos" && <span className="ml-1 text-gray-400">· {statusFilter}</span>}
          </p>
          <FunnelIcon className="w-4 h-4 text-gray-300" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 rounded-full border-4 border-amazon_blue border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">No hay pedidos para mostrar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Pedido", "Cliente", "Productos", "Total", "Pago", "Envío", "Estado", "Fecha", "Acciones"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {o.orderCode || o.id.slice(0, 8) + "…"}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 whitespace-nowrap">{o.customer?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{o.customer?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px]">
                      {(o.items || []).slice(0, 2).map((it: any, i: number) => (
                        <p key={i} className="truncate">{it.title} x{it.quantity || 1}</p>
                      ))}
                      {(o.items || []).length > 2 && <p className="text-gray-400">+{o.items.length - 2} más</p>}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">S/ {fmt(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {o.paymentMethodLabel || "Yape"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.shippingCarrier === "OLVA" ? "bg-orange-100 text-orange-700" : "bg-sky-100 text-sky-700"}`}>
                        {o.shippingCarrierLabel || "Shalom"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {o.createdAt ? fmtDate(o.createdAt) : o.date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDetailOrder(o)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-amazon_blue transition"
                          title="Ver detalle"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => notifyByWhatsApp(o)}
                          className="p-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition"
                          title="Notificar WhatsApp"
                        >
                          <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShipModalOrder(o)}
                          className="p-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
                          title="Gestionar envío"
                        >
                          <TruckIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {detailOrder && (
        <Modal title={`Pedido ${detailOrder.orderCode || detailOrder.id.slice(0, 8)}`} onClose={() => setDetailOrder(null)}>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <Section title="Cliente">
                <Row label="Nombre"   value={detailOrder.customer?.name} />
                <Row label="Email"    value={detailOrder.customer?.email} />
                <Row label="Teléfono" value={detailOrder.customer?.phone} />
                <Row label="DNI"      value={detailOrder.customer?.dni} />
                <Row label="Ubicación" value={detailOrder.customer?.locationLine} />
              </Section>
              <Section title="Envío">
                <Row label="Agencia" value={detailOrder.shippingCarrierLabel || "Shalom"} />
                {detailOrder.shippingCarrier === "SHALOM"
                  ? <Row label="Agencia Shalom" value={detailOrder.customer?.shalomAgency} />
                  : <>
                      <Row label="Dirección Olva" value={detailOrder.customer?.address} />
                      <Row label="Referencia"     value={detailOrder.customer?.reference} />
                    </>
                }
              </Section>
              <Section title="Pago">
                <Row label="Método" value={detailOrder.paymentMethodLabel || "Yape"} />
                <Row label="Total"  value={`S/ ${fmt(detailOrder.total)}`} />
              </Section>
              {detailOrder.customer?.notes && <Section title="Notas"><p className="text-xs text-gray-600">{detailOrder.customer.notes}</p></Section>}
            </div>
            <div className="space-y-3">
              <Section title="Productos">
                <ul className="space-y-1.5">
                  {(detailOrder.items || []).map((it: any, i: number) => (
                    <li key={i} className="flex justify-between text-xs text-gray-700">
                      <span className="truncate mr-2">{it.title} x{it.quantity || 1}</span>
                      <span className="font-semibold shrink-0">S/ {fmt(Number(it.price || 0))}</span>
                    </li>
                  ))}
                </ul>
              </Section>
              {detailOrder.paymentImage && (
                <Section title="Comprobante de pago">
                  <a href={detailOrder.paymentImage} target="_blank" rel="noreferrer">
                    <img src={detailOrder.paymentImage} alt="Comprobante" className="rounded-lg border border-gray-200 max-h-48 object-contain hover:opacity-90 transition" />
                  </a>
                </Section>
              )}
              <Section title="Cambiar estado">
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { updateStatus(detailOrder, s); setDetailOrder(null); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        detailOrder.status === s
                          ? getStatusStyle(s) + " font-bold"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal envío */}
      {shipModalOrder && (
        <Modal title={`Gestionar envío — ${shipModalOrder.orderCode || shipModalOrder.id.slice(0, 8)}`} onClose={() => setShipModalOrder(null)}>
          <p className="text-sm text-gray-500 mb-4">Agencia: <strong>{shipModalOrder.shippingCarrierLabel || "Shalom"}</strong></p>
          {shipModalOrder.shippingCarrier === "SHALOM" ? (
            <div className="space-y-3">
              <Field label="Clave Shalom">
                <input value={shipData[shipModalOrder.id]?.shalomPickupCode || ""} onChange={(e) => setShipField(shipModalOrder.id, "shalomPickupCode", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </Field>
              <Field label="Voucher Shalom (imagen)">
                <input type="file" accept="image/*" onChange={(e) => handleShipImage(shipModalOrder.id, "shalomVoucherImage", e.target.files?.[0])} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
                {shipData[shipModalOrder.id]?.shalomVoucherImage && <a href={shipData[shipModalOrder.id].shalomVoucherImage} target="_blank" rel="noreferrer" className="text-xs text-amazon_blue hover:underline mt-1 block">Ver voucher cargado</a>}
              </Field>
            </div>
          ) : (
            <Field label="Tracking Olva (imagen voucher)">
              <input type="file" accept="image/*" onChange={(e) => handleShipImage(shipModalOrder.id, "olvaTrackingImage", e.target.files?.[0])} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" />
              {shipData[shipModalOrder.id]?.olvaTrackingImage && <a href={shipData[shipModalOrder.id].olvaTrackingImage} target="_blank" rel="noreferrer" className="text-xs text-amazon_blue hover:underline mt-1 block">Ver tracking cargado</a>}
            </Field>
          )}
          <div className="flex flex-wrap gap-2 justify-end mt-5 pt-4 border-t border-gray-100">
            <button onClick={() => setShipModalOrder(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50">Cancelar</button>
            <button onClick={() => updateStatus(shipModalOrder, "Enviado", { notify: false, closeModal: true })} className="px-4 py-2 rounded-lg border border-orange-300 text-orange-700 text-sm font-semibold hover:bg-orange-50">Guardar enviado</button>
            <button onClick={() => updateStatus(shipModalOrder, "Enviado", { notify: true, closeModal: true })} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">Guardar y notificar WhatsApp</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Componentes auxiliares ──────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-900">{title}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value || "—"}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/orders", permanent: false } };
  return { props: {} };
};
