import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const data = [
  {
    q: "¿Cuáles son los medios de pago?",
    a: "Aceptamos Yape y transferencia bancaria. Al finalizar tu compra en Checkout podrás elegir el método y confirmar por WhatsApp."
  },
  {
    q: "¿Hacen envíos?",
    a: "Sí, enviamos a todo el Perú. El envío es gratis en pedidos desde S/ 120. En compras menores el costo de envío es desde S/ 10."
  },
  {
    q: "¿Cómo elijo la resina adecuada?",
    a: "Para joyería y piezas pequeñas recomendamos resina epoxi 1:1. Para recubrimientos y mayor dureza, epoxi estándar con catalizador."
  },
  {
    q: "¿Qué incluye un kit de resina?",
    a: "Incluye resina, catalizador, instrucciones básicas, y puede agregar pigmentos o moldes según tu elección."
  },
  {
    q: "¿Aceptan devoluciones?",
    a: "Aceptamos devoluciones dentro de 7 días si el producto está sellado y en perfectas condiciones. Contáctanos para coordinar."
  },
  {
    q: "¿Puedo recoger en tienda?",
    a: "Sí, podemos coordinar recojo en Lima previa confirmación por WhatsApp."
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Rossy Resina — Preguntas frecuentes</title>
      </Head>

      <h1 className="text-2xl font-semibold mb-4 text-amazon_blue">Preguntas frecuentes</h1>
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {data.map((item, idx) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full text-left px-4 py-3 flex items-center justify-between"
            >
              <span className="font-medium">{item.q}</span>
              <span className="text-gray-500">{open === idx ? "–" : "+"}</span>
            </button>
            {open === idx && (
              <div className="px-4 pb-4 text-gray-700">{item.a}</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-700">
        <p>¿No encontraste tu respuesta? Escríbenos por <Link href="/contact" className="text-amazon_blue hover:underline">Contacto</Link> o confirma por WhatsApp desde el Checkout.</p>
      </div>
    </div>
  );
}
