import React, { useEffect, useMemo, useState } from "react";
import { StateProps, StoreProduct } from "../../type";
import { useSelector } from "react-redux";
import CartProduct from "@/components/CartProduct";
import ResetCart from "@/components/ResetCart";
import Link from "next/link";
import FormattedPrice from "@/components/FormattedPrice";
import Products from "@/components/Products";

const CartPage = () => {
  const { productData: cartItems } = useSelector((state: StateProps) => state.next);
  const [recs, setRecs] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum: number, p: StoreProduct) => sum + p.price * p.quantity,
      0
    );
    const total = subtotal;
    return { subtotal, total };
  }, [cartItems]);

  const freeShippingGap = Math.max(0, 120 - totals.subtotal);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/products?_=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((rows) => {
        if (!alive) return;
        setRecs(Array.isArray(rows) ? rows.slice(0, 12) : []);
      })
      .catch(() => {
        if (!alive) return;
        setRecs([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const recommendedProducts = useMemo(() => {
    if (Array.isArray(recs) && recs.length > 0) return recs;
    const fallback = cartItems.map((item) => ({
      _id: item._id,
      code: item.code,
      title: item.title,
      brand: item.brand,
      category: item.category,
      description: item.description,
      image: item.image,
      images: item.images,
      isNew: item.isNew,
      oldPrice: item.oldPrice,
      price: item.price,
    }));
    return Array.from(new Map(fallback.map((p) => [String(p._id), p])).values()).slice(0, 8);
  }, [recs, cartItems]);

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-4 md:px-6 md:py-6">
      {!mounted ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center md:p-8">
          <h1 className="text-lg font-semibold text-gray-900">Cargando carrito...</h1>
        </div>
      ) : cartItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
            <section className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">Carrito de compras</h1>
                  <span className="text-sm text-gray-500">{cartItems.length} articulo(s)</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Tu carrito queda guardado automáticamente en este dispositivo.
                </p>
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {freeShippingGap > 0 ? (
                    <span>
                      Agrega <strong>S/ {freeShippingGap.toFixed(2)}</strong> para envío gratis.
                    </span>
                  ) : (
                    <span>Envío gratis aplicado a tu pedido.</span>
                  )}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.min(100, (totals.subtotal / 120) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Tus productos</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                    <ResetCart />
                    <Link href="/" className="text-gray-600 hover:text-amazon_blue">
                      Seguir comprando
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-3">
                  {cartItems.map((item: StoreProduct) => (
                    <div key={item._id}>
                      <CartProduct item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 lg:sticky lg:top-24">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Resumen</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      <FormattedPrice amount={totals.subtotal} />
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold md:text-lg">
                    <span>Total</span>
                    <span>
                      <FormattedPrice amount={totals.total} />
                    </span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="mt-4 block h-11 w-full rounded-full bg-orange-500 text-center text-sm font-semibold leading-[44px] text-white hover:brightness-105"
                >
                  Ir a pagar
                </Link>
                <div className="mt-3 grid gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Pagos seguros y protegidos
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Devoluciones sin costo segun politica
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Envíos a todo Perú
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Puede que te interese</h3>
            {recommendedProducts.length > 0 ? (
              <Products
                productData={recommendedProducts}
                gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
              />
            ) : (
              <p className="text-sm text-gray-600">Aún no hay productos para recomendar.</p>
            )}
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center md:p-8">
          <h1 className="text-lg font-semibold text-gray-900">Tu carrito esta vacio</h1>
          <p className="mt-1 text-sm text-gray-600">Descubre productos y agrega tus favoritos.</p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-amazon_blue px-5 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Ir a comprar
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
