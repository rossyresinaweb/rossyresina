import Head from "next/head";
import { useSelector } from "react-redux";
import { StateProps, StoreProduct } from "../../type";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import FormattedPrice from "@/components/FormattedPrice";
import CartPayment from "@/components/CartPayment";

export default function CheckoutPage() {
  const { productData, userInfo } = useSelector((state: StateProps) => state.next);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (userInfo) {
      // @ts-ignore
      setEmail(userInfo.email || "");
      // @ts-ignore
      setName(userInfo.name || "");
      // @ts-ignore
      setPhone(userInfo.phone || "");
    }
  }, [userInfo]);

  const totals = useMemo(() => {
    const subtotal = productData.reduce((sum: number, p: StoreProduct) => sum + p.price * p.quantity, 0);
    const shipping = subtotal > 120 ? 0 : 10;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [productData]);
  const normImg = (s?: string) => {
    const t = String(s || "");
    if (!t) return "/favicon-96x96.png";
    let u = t.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    if (!u.startsWith("/")) u = "/" + u;
    return u;
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Rossy Resina — Checkout</title>
      </Head>
{productData.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow">
          <p className="text-lg">Tu carrito está vacío.</p>
          <Link href="/" className="inline-block mt-4 px-4 py-2 rounded bg-gradient-to-r from-brand_purple via-brand_pink to-brand_teal text-white hover:brightness-105">Ir a comprar</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Datos de envío</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Nombre completo</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Correo electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Teléfono</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Distrito</label>
                <input value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Dirección</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Ciudad</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Notas del pedido</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 h-24" />
              </div>
            </div>
          </section>

          <aside className="md:col-span-1 md:sticky md:top-24 h-fit space-y-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
              <ul className="divide-y divide-gray-200">
                {productData.map((p: StoreProduct) => (
                  <li key={p._id} className="py-3 flex items-center gap-3">
                    <img src={normImg(p.image)} alt={p.title} className="rounded object-cover w-[60px] h-[60px]" loading="lazy" />
                    <div className="flex-1">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-gray-600">Cantidad: {p.quantity}</p>
                    </div>
                    <div className="font-semibold"><FormattedPrice amount={p.price * p.quantity} /></div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span><FormattedPrice amount={totals.subtotal} /></span></div>
                <div className="flex justify-between"><span>Envío</span><span>{totals.shipping === 0 ? "Gratis" : <FormattedPrice amount={totals.shipping} />}</span></div>
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span><FormattedPrice amount={totals.total} /></span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <CartPayment email={email} />
              <p className="text-xs text-gray-600 mt-2">Medios de pago disponibles: Yape y transferencia bancaria BCP.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
