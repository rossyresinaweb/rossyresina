import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "./header/Header";
import BottomHeader from "./header/BottomHeader";
import Footer from "./Footer";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import { HomeIcon, MagnifyingGlassIcon, HeartIcon, ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";

interface Props {
  children: ReactElement;
}

const RootLayout = ({ children }: Props) => {
  const router = useRouter();
  const hideBottomHeader = router.pathname === "/cart";
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [hideWhatsapp, setHideWhatsapp] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBubbleVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  const cartCount = useSelector((state: any) =>
    Array.isArray(state?.next?.productData) ? state.next.productData.length : 0
  );
  const waPhoneRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE || "51966357648";
  const waPhone = waPhoneRaw.replace(/\D/g, "");
  const waHref = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    "Hola, quiero informacion sobre sus productos."
  )}`;

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHideWhatsapp(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.05 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  const mobileTabs = [
    { href: "/", label: "Inicio", icon: HomeIcon, active: router.pathname === "/" },
    { href: "/search", label: "Buscar", icon: MagnifyingGlassIcon, active: router.pathname.startsWith("/search") },
    { href: "/favorite", label: "Favoritos", icon: HeartIcon, active: router.pathname.startsWith("/favorite") },
    { href: "/cart", label: "Carrito", icon: ShoppingCartIcon, active: router.pathname.startsWith("/cart") },
    {
      href: "/account",
      label: "Cuenta",
      icon: UserIcon,
      active: router.pathname.startsWith("/account") || router.pathname.startsWith("/sign-in"),
    },
  ];

  return (
    <>
      <Header />
      {!hideBottomHeader && (
        <div className="hidden md:block">
          <BottomHeader />
        </div>
      )}
      <div className="pb-20 md:pb-0">{children}</div>
      <div ref={footerRef}>
        <Footer />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-[75] border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[11px] ${
                  tab.active ? "font-semibold text-amazon_blue" : "text-gray-500"
                }`}
              >
                <span className="relative">
                  <Icon className={`h-5 w-5 ${tab.active ? "text-amazon_blue" : "text-gray-500"}`} />
                  {tab.href === "/cart" && cartCount > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amazon_blue px-1 text-[9px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {!hideWhatsapp && (
        <div className="fixed bottom-24 right-4 z-[70] md:bottom-6 flex flex-col items-end gap-2">
          {/* Burbuja del asistente */}
          {bubbleVisible && !showChat && (
            <div className="flex items-end gap-2 animate-fadeInUp">
              <div className="relative max-w-[220px] rounded-2xl rounded-br-none bg-white px-4 py-3 shadow-xl border border-gray-100">
                <p className="text-[11px] font-semibold text-green-600 mb-1">Asistente Rossy</p>
                <p className="text-xs text-gray-700 leading-snug">¡Hola! ¿Puedo ayudarte a mejorar tu estadía dentro de nuestra tienda? 😊</p>
                <div className="absolute -bottom-2 right-0 w-3 h-3 bg-white border-r border-b border-gray-100" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
              </div>
              <button
                onClick={() => setBubbleVisible(false)}
                className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 text-xs"
                aria-label="Cerrar mensaje"
              >✕</button>
            </div>
          )}

          {/* Chat expandido */}
          {showChat && (
            <div className="w-72 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-zoomIn">
              {/* Header */}
              <div className="flex items-center gap-3 bg-green-500 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <FaWhatsapp className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Asistente Rossy</p>
                  <p className="text-[11px] text-green-100">En línea</p>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/80 hover:text-white text-lg leading-none"
                  aria-label="Cerrar chat"
                >✕</button>
              </div>
              {/* Mensaje */}
              <div className="bg-[#e5ddd5] px-4 py-4">
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500">
                    <FaWhatsapp className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-white px-3 py-2 shadow-sm max-w-[200px]">
                    <p className="text-[11px] font-semibold text-green-600 mb-1">Asistente Rossy</p>
                    <p className="text-xs text-gray-700 leading-relaxed">¡Hola! ¿Puedo ayudarte a mejorar tu estadía dentro de nuestra tienda? 😊</p>
                    <p className="text-[10px] text-gray-400 text-right mt-1">ahora</p>
                  </div>
                </div>
              </div>
              {/* Botón abrir WhatsApp */}
              <div className="bg-white px-4 py-3">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  Chatear por WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Botón principal */}
          <button
            onClick={() => { setShowChat((v) => !v); setBubbleVisible(false); }}
            aria-label="Abrir asistente WhatsApp"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110"
          >
            <FaWhatsapp className="h-7 w-7" />
          </button>
        </div>
      )}
    </>
  );
};

export default RootLayout;
