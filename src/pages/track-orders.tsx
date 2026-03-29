import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Products from "@/components/Products";
import type { ProductProps } from "../../type";
import FormattedPrice from "@/components/FormattedPrice";
import { useSession } from "next-auth/react";

const statusTabs = ["Ver todo", "Pendiente por confirmar", "Confirmado", "En proceso de envío", "Enviado"] as const;

type TabKey = (typeof statusTabs)[number];

type OrderItem = {
  title: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  id: string;
  orderCode?: string;
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
  items: OrderItem[];
  customer: {
    email: string;
  };
  paymentImage?: string;
};

export default function TrackOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("Ver todo");
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [promos, setPromos] = useState<ProductProps[]>([]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const qEmail = url.searchParams.get("email") || "";
    if (qEmail) setEmail(qEmail);
  }, []);

  const fetchOrders = async () => {
    const lookupEmail = email.trim();
    const url = lookupEmail ? `/api/orders?email=${encodeURIComponent(lookupEmail)}` : "/api/orders";
    setLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email.trim()) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    const sessionEmail = String((session?.user as any)?.email || "").trim();
    if (!sessionEmail) return;
    setEmail(sessionEmail);
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, [session?.user]);

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      "Pendiente por confirmar": 0,
      Confirmado: 0,
      "En proceso de envío": 0,
      Enviado: 0,
    };
    orders.forEach((o) => {
      if (base[o.status] !== undefined) {
        base[o.status] += 1;
        return;
      }
      if (normalizeStatus(o.status) === normalizeStatus("En proceso de env?o")) {
        base["En proceso de env?o"] += 1;
      }
    });
    return base;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (activeTab !== "Ver todo") {
      list = list.filter((o) => normalizeStatus(o.status) === normalizeStatus(activeTab));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const oid = String(o.orderCode || o.id || "").toLowerCase();
        if (oid.includes(q)) return true;
        if (String(o.id || "").toLowerCase().includes(q)) return true;
        return o.items.some((it) => it.title.toLowerCase().includes(q));
      });
    }
    return list;
  }, [orders, activeTab, search]);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/products?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((rows) => {
        if (!mounted) return;
        setPromos(Array.isArray(rows) ? rows.slice(0, 10) : []);
      })
      .catch(() => {
        if (!mounted) return;
        setPromos([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-[70vh] px-6 py-8 bg-gray-50">
      <Head>
        <title>Mis pedidos - Rossy Resina</title>
        <meta name="description" content="Revisa tus pedidos y recomendaciones personalizadas." />
      </Head>

      <div className="max-w-screen-2xl mx-auto">
        <div className="text-sm text-gray-500 mb-4">Inicio / Cuenta</div>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
          <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
            <h2 className="text-lg font-semibold mb-3">Cuenta</h2>
            <nav className="flex flex-col gap-2 text-sm text-gray-700">
              <Link href="/account" className="px-2 py-1 rounded hover:bg-gray-50">General</Link>
              <span className="px-2 py-1 rounded bg-gray-50 font-semibold">Pedidos</span>
              <span className="px-2 py-1 rounded hover:bg-gray-50">Pago</span>
              <span className="px-2 py-1 rounded hover:bg-gray-50">Reembolsos y devoluciones</span>
              <span className="px-2 py-1 rounded hover:bg-gray-50">Valoraciones</span>
              <span className="px-2 py-1 rounded hover:bg-gray-50">Ajustes</span>
              <span className="px-2 py-1 rounded hover:bg-gray-50">Dirección de envío</span>
              <Link href="/messages" className="px-2 py-1 rounded hover:bg-gray-50">Centro de mensajes</Link>
            </nav>
          </aside>

          <section className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                {statusTabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTab(t)}
                    className={
                      "pb-2 border-b-2 " +
                      (activeTab === t ? "border-orange-500 text-gray-900 font-semibold" : "border-transparent text-gray-600")
                    }
                  >
                    {t}{t !== "Ver todo" ? ` (${counts[t] || 0})` : ""}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-3 items-center">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nº de pedido o artículo"
                  className="h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-orange-400"
                />
                <div className="flex items-center gap-2">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo para buscar pedidos"
                    disabled={Boolean((session?.user as any)?.email)}
                    className="h-11 flex-1 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-orange-400"
                  />
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="h-11 px-4 rounded-md bg-orange-500 text-white text-sm font-semibold"
                  >
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">Cargando pedidos...</div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid gap-4">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-gray-900">{o.status}</div>
                      <div className="text-sm text-gray-600">Pedido: {o.orderCode || o.id}</div>
                      <div className="text-sm text-gray-600">Fecha: {o.date}</div>
                    </div>
                    {normalizeStatus(o.status) === normalizeStatus("Confirmado") && (
                      <div className="mt-2 text-sm text-emerald-700">
                        Pedido confirmado. En proceso de envío. Comunícate al 961770723 para seguimiento.
                      </div>
                    )}
                    {normalizeStatus(o.status) === normalizeStatus("En proceso de env?o") && (
                      <div className="mt-2 text-sm text-emerald-700">
                        En proceso de envío. Comunícate al 961770723 para seguimiento.
                      </div>
                    )}
                    {o.status === "Enviado" && (
                      <div className="mt-2 text-sm text-emerald-700 space-y-1">
                        <p>Tu pedido fue enviado por {o.shippingCarrierLabel || "agencia"}.</p>
                        {o.shippingCarrier === "SHALOM" && o.shalomPickupCode && (
                          <p>Clave de recojo: <strong>{o.shalomPickupCode}</strong></p>
                        )}
                        {o.shippingCarrier === "SHALOM" && o.shalomVoucherImage && (
                          <p>
                            <a href={o.shalomVoucherImage} target="_blank" rel="noreferrer" className="text-amazon_blue hover:underline">
                              Ver voucher de envío
                            </a>
                          </p>
                        )}
                        {o.shippingCarrier === "OLVA" && o.olvaTrackingImage && (
                          <p>
                            <a href={o.olvaTrackingImage} target="_blank" rel="noreferrer" className="text-amazon_blue hover:underline">
                              Ver tracking de Olva
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mt-4 border-t border-gray-100 pt-4 grid gap-3">
                      <div className="text-xs text-gray-600">
                        Mtodo de pago: <span className="font-semibold text-gray-800">{o.paymentMethodLabel || "Transferencia/Yape"}</span>
                      </div>
                      {o.items.map((it, idx) => (
                        <div key={`${o.id}-${idx}`} className="grid grid-cols-[72px_minmax(0,1fr)_140px] gap-3 items-center">
                          <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center text-xs text-gray-500">
                            {it.image ? (
                              <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                            ) : (
                              "Producto"
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 line-clamp-2">{it.title}</p>
                            <p className="text-xs text-gray-500">x{it.quantity}</p>
                          </div>
                          <div className="text-right text-sm text-gray-900">
                            <FormattedPrice amount={it.price} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                      <div className="text-sm font-semibold text-gray-900">
                        Total: <FormattedPrice amount={o.total} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900">Aún no has realizado pedidos</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Explora nuestros productos y encuentra algo especial para ti.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/productos"
                    className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:brightness-95"
                  >
                    Ver productos
                  </Link>
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Volver al inicio
                  </Link>
                </div>

                <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-orange-700">Promocin especial</p>
                  <p className="text-sm text-orange-700">Descuento en tu primera compra. Aprovchalo hoy.</p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seguro que te gusta</h3>
                  <Products
                    productData={promos}
                    gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-5"
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
  const normalizeStatus = (value: string) =>
    String(value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
