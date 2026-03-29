import Link from "next/link";
import { useEffect, useState } from "react";
import { SparklesIcon, TruckIcon, BoltIcon } from "@heroicons/react/24/outline";

type TopBarAd = {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  tags: string[];
  cta: string;
  href: string;
  accent: string;
  bg: string;
};

const ADS: TopBarAd[] = [
  {
    icon: <SparklesIcon className="w-4 h-4" />,
    eyebrow: "Sorteo activo",
    title: "Participa y gana un Kit Resinero completo",
    subtitle: "Válido para nuevas participantes · Ganadores cada semana",
    tags: ["Gratis", "Cupos limitados", "Premios reales"],
    cta: "Participar ahora",
    href: "/sorteos-resineros",
    accent: "bg-white text-[#7c3aed]",
    bg: "from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6]",
  },
  {
    icon: <BoltIcon className="w-4 h-4" />,
    eyebrow: "Nueva colección",
    title: "Moldes de silicona exclusivos ya disponibles",
    subtitle: "Diseños para velas, llaveros, bisutería y más",
    tags: ["Stock nuevo", "Envío rápido", "Compra segura"],
    cta: "Ver colección",
    href: "/categoria/moldes-de-silicona",
    accent: "bg-white text-[#0369a1]",
    bg: "from-[#0369a1] via-[#0284c7] to-[#0ea5e9]",
  },
  {
    icon: <TruckIcon className="w-4 h-4" />,
    eyebrow: "Ofertas flash",
    title: "Descuentos reales en resinas y pigmentos",
    subtitle: "Precios especiales por tiempo limitado · Hasta agotar stock",
    tags: ["Hasta 40% off", "Top vendidos", "Solo hoy"],
    cta: "Ver ofertas",
    href: "/productos?ofertas=1",
    accent: "bg-white text-[#be123c]",
    bg: "from-[#be123c] via-[#e11d48] to-[#f43f5e]",
  },
];

const TopBar = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (ADS.length <= 1) return;
    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % ADS.length);
        setVisible(true);
      }, 300);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const current = ADS[index];

  return (
    <div className={`w-full bg-gradient-to-r ${current.bg} text-white transition-all duration-700`}>
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-6">
        <div className={`py-2.5 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
          <div className="flex items-center justify-between gap-4">

            {/* Izquierda: eyebrow + título + subtítulo */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                {current.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                    {current.eyebrow}
                  </span>
                  <span className="hidden md:inline-block h-3 w-px bg-white/20" />
                  <p className="text-sm md:text-base font-bold leading-tight truncate">
                    {current.title}
                  </p>
                </div>
                <p className="hidden lg:block text-[11px] text-white/75 mt-0.5 truncate">
                  {current.subtitle}
                </p>
              </div>
            </div>

            {/* Centro: tags */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
              {current.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/15 border border-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* Derecha: dots + CTA */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5">
                {ADS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setVisible(false); setTimeout(() => { setIndex(i); setVisible(true); }, 300); }}
                    className={`rounded-full transition-all duration-300 ${i === index ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"}`}
                    aria-label={`Ir al anuncio ${i + 1}`}
                  />
                ))}
              </div>
              <Link
                href={current.href}
                className={`inline-flex h-8 items-center justify-center rounded-full ${current.accent} px-4 text-xs font-bold transition hover:opacity-90 whitespace-nowrap shadow-sm`}
              >
                {current.cta} →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
