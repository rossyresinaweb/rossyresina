import { Bars3Icon } from "@heroicons/react/24/outline";
import { StateProps } from "../../../type";
import { signOut } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "@/store/nextSlice";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const BottomHeader = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userInfo } = useSelector((state: StateProps) => state.next);
  const handleSignOut = () => {
    signOut();
    dispatch(removeUser());
  };
  const [open, setOpen] = useState(false);
  const promoMessages = [
    "Envío rápido a todo Perú",
    "Stock limitado en productos top",
    "Compra segura y atención por WhatsApp",
  ];
  const [promoIndex, setPromoIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isCurrentPath = (href: string) => {
    const current = (router.asPath || "").split("?")[0].replace(/\/+$/, "") || "/";
    const target = href.split("?")[0].replace(/\/+$/, "") || "/";
    return current === target;
  };
  const mega = [
    { title: "Moldes de silicona", slug: "moldes-de-silicona", items: ["Redondos", "Rectangulares", "Geométricos", "Letras y números", "Personalizados"] },
    { title: "Pigmentos", slug: "pigmentos", items: ["Líquidos", "En polvo", "Glitter", "Perlado"] },
    { title: "Accesorios", slug: "accesorios", items: ["Herramientas", "Bases", "Cadenas", "Anillas"] },
    { title: "Resina", slug: "resina", items: ["Epoxi", "UV", "Catalizador"] },
    { title: "Creaciones", slug: "creaciones", items: ["Joyas", "Llaveros", "Decoración", "Arte"] },
    { title: "Talleres", slug: "talleres", items: ["Principiantes", "Avanzados", "Fechas"] },
  ];
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = menuRef.current;
      if (open && el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promoMessages.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [promoMessages.length]);

  return (
    <div ref={menuRef} className="w-full min-h-12 bg-white text-sm text-gray-700 border-b border-gray-200">
      <div className="hidden md:flex items-center relative max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 py-2 gap-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="group inline-flex items-center gap-2.5 h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-amazon_blue hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 group-hover:bg-amazon_blue group-hover:text-white transition-all duration-300">
            <Bars3Icon className="w-4 h-4" />
          </span>
          <span className="font-medium text-[15px] text-gray-800">Ver categorías</span>
        </button>
        {open && (
          <div className="absolute top-[54px] left-0 right-0 bg-white text-black shadow-xl z-50 border-t border-gray-200" onMouseLeave={() => setOpen(false)}>
            <div className="max-w-screen-2xl mx-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {mega.map((col) => (
                <div key={col.slug}>
                  <Link href={`/categoria/${col.slug}`} className="font-semibold px-2 py-1 rounded hover:bg-gray-100 inline-block">
                    {col.title}
                  </Link>
                  <ul className="mt-2 text-sm text-gray-700 grid gap-1">
                    {col.items.map((it) => (
                      <li key={it}>
                        <Link href={`/categoria/${col.slug}`} className="px-2 py-1 rounded hover:bg-gray-100 inline-block" onClick={() => setOpen(false)}>
                          {it}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-amazon_blue rounded-md p-6 text-white flex flex-col justify-center">
                <p className="text-lg font-semibold">Descubre nuevas resinas</p>
                <p className="text-sm opacity-90">Ofertas y novedades de la semana</p>
                <Link href="/categoria/resina" className="mt-4 inline-block px-4 py-2 rounded-md bg-white text-amazon_blue hover:brightness-95" onClick={() => setOpen(false)}>
                  Ver catálogo
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <nav className="inline-flex items-center gap-1 p-1">
            <Link
              href="/"
              className={`inline-flex items-center h-9 px-4 rounded-lg text-[15px] transition-all duration-300 ${
                isCurrentPath("/") ? "bg-amazon_blue text-white font-semibold shadow-md" : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className={`inline-flex items-center h-9 px-4 rounded-lg text-[15px] transition-all duration-300 ${
                isCurrentPath("/productos") ? "bg-amazon_blue text-white font-semibold shadow-md" : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              Productos
            </Link>
            <Link
              href="/blog"
              className={`inline-flex items-center h-9 px-4 rounded-lg text-[15px] transition-all duration-300 ${
                isCurrentPath("/blog") ? "bg-amazon_blue text-white font-semibold shadow-md" : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/capacitaciones"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center h-9 px-4 rounded-lg text-[15px] transition-all duration-300 ${
                isCurrentPath("/capacitaciones") ? "bg-amazon_blue text-white font-semibold shadow-md" : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              Capacitaciones
            </Link>
          </nav>
        </div>

        <div className="shrink-0 flex items-center">
          <Link
            href="/productos?ofertas=1"
            className="inline-flex items-center gap-1.5 h-11 px-2 text-[#c21885] transition-all duration-300 hover:opacity-90 hover:scale-105"
          >
            <span className="inline-flex items-center justify-center text-[24px] leading-none font-extrabold text-[#c21885] tracking-tight">
              10%
            </span>
            <span className="leading-tight">
              <span className="block font-semibold text-[15px]">Descuento en tu primera compra</span>
              <span className="block text-[11px] text-[#a31370]">{promoMessages[promoIndex]}</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="md:hidden px-3 py-2">
        <div className="no-scrollbar flex w-full snap-x snap-proximity gap-4 overflow-x-auto pl-1 pr-8 touch-pan-x">
          {mega.map((col) => (
            <Link
              key={col.slug}
              href={`/categoria/${col.slug}`}
              className="shrink-0 snap-start pb-2 text-[15px] font-medium leading-tight text-gray-600 whitespace-nowrap"
              onClick={(e) => {
                if (isCurrentPath(`/categoria/${col.slug}`)) e.preventDefault();
              }}
            >
              {col.title}
            </Link>
          ))}
          <Link
            href="/capacitaciones"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 snap-start pb-2 text-[15px] font-medium leading-tight text-gray-600 whitespace-nowrap"
            onClick={(e) => {
              if (isCurrentPath("/capacitaciones")) e.preventDefault();
            }}
          >
            Capacitaciones
          </Link>
          <Link
            href="/blog"
            className="shrink-0 snap-start pb-2 text-[15px] font-medium leading-tight text-gray-600 whitespace-nowrap"
            onClick={(e) => {
              if (isCurrentPath("/blog")) e.preventDefault();
            }}
          >
            Blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
