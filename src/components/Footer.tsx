import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

const LINKS = {
  tienda: [
    { label: "Todos los productos", href: "/productos" },
    { label: "Resina epóxica", href: "/categoria/resina" },
    { label: "Moldes de silicona", href: "/categoria/moldes-de-silicona" },
    { label: "Pigmentos", href: "/categoria/pigmentos" },
    { label: "Ofertas", href: "/productos?ofertas=1" },
  ],
  soporte: [
    { label: "Preguntas frecuentes", href: "/faq" },
    { label: "Contacto", href: "/contact" },
    { label: "Rastrear pedido", href: "/track-orders" },
    { label: "Términos y condiciones", href: "/terms" },
    { label: "Sobre nosotros", href: "/about-us" },
  ],
  comunidad: [
    { label: "Capacitaciones", href: "/capacitaciones" },
    { label: "Blog", href: "/blog" },
    { label: "Sorteos resineros", href: "/sorteos-resineros" },
    { label: "Comunidad", href: "/comunidad" },
  ],
};

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebook },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "WhatsApp", href: "https://wa.me/51966357648", icon: FaWhatsapp },
  { label: "TikTok", href: "https://tiktok.com", icon: FaTiktok },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) { setError("Ingresa un correo válido."); return; }
    try {
      setSending(true);
      setError("");
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "No se pudo completar."); return; }
      setDone(true);
      setEmail("");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="w-full bg-[#0f1117] text-white">

      {/* Newsletter banner */}
      <div className="border-b border-white/5 bg-amazon_blue/10">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amazon_blue">Newsletter</p>
              <h3 className="mt-1 text-xl font-bold text-white">Recibe novedades y ofertas exclusivas</h3>
              <p className="mt-1 text-sm text-white/50">Sin spam. Solo lo que te interesa.</p>
            </div>
            {done ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircleIcon className="w-5 h-5" />
                ¡Suscripción completada!
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
                <div className="relative flex-1">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-amazon_blue transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="h-11 px-5 rounded-xl bg-amazon_blue text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-60 flex items-center gap-2 shrink-0"
                >
                  {sending ? "..." : <><span>Suscribirse</span><ArrowRightIcon className="w-4 h-4" /></>}
                </button>
              </form>
            )}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amazon_blue flex items-center justify-center text-white font-black text-sm shrink-0">RR</div>
              <div>
                <p className="font-bold text-white text-lg leading-none">Rossy Resina</p>
                <p className="text-[11px] text-white/30 tracking-widest uppercase">Perú</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-xs">
              Insumos y kits para resina epóxica, pigmentos, moldes y talleres para emprendedores en Perú.
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 shrink-0" />
                <span>Lima, Perú</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 shrink-0" />
                <span>+51 966 357 648</span>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 shrink-0" />
                <span>contacto@rossyresina.com</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">Tienda</p>
            <ul className="space-y-2.5">
              {LINKS.tienda.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white transition flex items-center gap-1.5 group">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition -ml-4 group-hover:ml-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">Soporte</p>
            <ul className="space-y-2.5">
              {LINKS.soporte.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white transition flex items-center gap-1.5 group">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition -ml-4 group-hover:ml-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-4">Comunidad</p>
            <ul className="space-y-2.5">
              {LINKS.comunidad.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white transition flex items-center gap-1.5 group">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition -ml-4 group-hover:ml-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <p>© {year} Rossy Resina · Todos los derechos reservados</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white/60 transition">Términos</Link>
            <Link href="/faq" className="hover:text-white/60 transition">Ayuda</Link>
            <Link href="/about-us" className="hover:text-white/60 transition">Nosotros</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
