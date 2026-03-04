import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ContactPage() {
  const shopEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@rossyresina.pe";
  const phoneRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE || "900000000";
  const whatsappRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE || phoneRaw;
  const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "Lima, Perú";

  const phone = useMemo(() => phoneRaw.replace(/[^0-9]/g, ""), [phoneRaw]);
  const whatsapp = useMemo(() => whatsappRaw.replace(/[^0-9]/g, ""), [whatsappRaw]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Consulta");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const s = encodeURIComponent(`[${subject}] ${name ? "- " + name : ""}`);
    const b = encodeURIComponent(`${message}\n\nNombre: ${name}\nCorreo: ${email}`);
    return `mailto:${shopEmail}?subject=${s}&body=${b}`;
  }, [shopEmail, subject, name, email, message]);

  const whatsappHref = useMemo(() => {
    const text = `Hola, soy ${name}. ${subject}.\n\n${message}\n\nCorreo: ${email}`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  }, [whatsapp, name, subject, message, email]);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Rossy Resina — Contacto</title>
      </Head>

      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-white rounded-lg p-6 shadow">
          <h1 className="text-2xl font-semibold mb-4">Contáctanos</h1>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Correo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Asunto</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-600">Mensaje</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 h-32" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <a href={mailtoHref} className="inline-block px-4 py-2 rounded bg-gradient-to-r from-brand_purple via-brand_pink to-brand_teal text-white hover:brightness-105">Enviar por Email</a>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded border border-brand_green text-brand_green hover:bg-brand_green hover:text-white">Enviar por WhatsApp</a>
          </div>
        </section>

        <aside className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">Información</h2>
          <ul className="text-sm text-gray-700 grid gap-2">
            <li><span className="font-medium">Teléfono:</span> {phoneRaw}</li>
            <li><span className="font-medium">WhatsApp:</span> {whatsappRaw}</li>
            <li><span className="font-medium">Correo:</span> {shopEmail}</li>
            <li><span className="font-medium">Dirección:</span> {address}</li>
          </ul>
          <div className="mt-4 text-sm text-gray-600">
            <p>Atendemos consultas sobre resina, moldes, pigmentos y talleres.</p>
            <p className="mt-1">Horario: Lunes a Sábado, 9:00–18:00.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
