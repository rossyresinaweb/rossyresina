import React, { useMemo } from "react";
import { StateProps, StoreProduct } from "../../type";
import { useSelector } from "react-redux";
import CartProduct from "@/components/CartProduct";
import ResetCart from "@/components/ResetCart";
import Link from "next/link";
import CartPayment from "@/components/CartPayment";
import FormattedPrice from "@/components/FormattedPrice";

const CartPage = () => {
  const { productData } = useSelector((state: StateProps) => state.next);
  const totals = useMemo(() => {
    const subtotal = productData.reduce((sum: number, p: StoreProduct) => sum + p.price * p.quantity, 0);
    const shipping = subtotal > 120 ? 0 : 10;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [productData]);
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-4">
      {productData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10">
          <div className="bg-white md:col-span-4 p-4 rounded-lg">
            <div className="flex items-center justify-between border-b-[1px] border-b-gray-400 pb-1">
              <p className="text-2xl font-semibold text-amazon_blue">Carrito de compras</p>
              <p className="text-lg font-semibold text-amazon_blue">Resumen</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              {productData.map((item: StoreProduct) => (
                <div key={item._id}>
                  <CartProduct item={item} />
                </div>
              ))}
              <div className="flex items-center gap-3 mt-2">
                <ResetCart />
                <Link href="/" className="text-sm px-3 py-2 rounded border border-gray-300 hover:bg-gray-100">Seguir comprando</Link>
              </div>
            </div>
          </div>
          <aside className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span><FormattedPrice amount={totals.subtotal} /></span></div>
                <div className="flex justify-between"><span>Envío</span><span>{totals.shipping === 0 ? "Gratis" : <FormattedPrice amount={totals.shipping} />}</span></div>
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span><FormattedPrice amount={totals.total} /></span></div>
              </div>
              <Link href="/checkout" className="mt-3 block w-full h-10 text-sm font-semibold bg-amazon_blue text-white rounded-lg hover:bg-amazon_yellow hover:text-black duration-300 text-center leading-10">Ir a Checkout</Link>
              <p className="text-xs text-gray-600 mt-2">Envío gratis en compras desde S/ 120.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <CartPayment />
            </div>
          </aside>
        </div>
      ) : (
        <div className="bg-white h-64 flex flex-col items-center justify-center py-5 rounded-lg shadow-lg">
          <h1 className="text-lg font-medium">Tu carrito está vacío</h1>
          <Link href="/" className="w-52 h-10 bg-amazon_blue text-white rounded-lg text-sm font-semibold hover:bg-amazon_yellow hover:text-black flex items-center justify-center mt-2">Ir a comprar</Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
