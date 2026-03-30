import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "./header/Header";
import BottomHeader from "./header/BottomHeader";
import Footer from "./Footer";
import Link from "next/link";
import { HomeIcon, MagnifyingGlassIcon, HeartIcon, ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import AssistantRossy from "./AssistantRossy";

interface Props {
  children: ReactElement;
}

const RootLayout = ({ children }: Props) => {
  const router = useRouter();
  const hideBottomHeader = router.pathname === "/cart";
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [hideAssistant, setHideAssistant] = useState(false);
  const cartCount = useSelector((state: any) =>
    Array.isArray(state?.next?.productData) ? state.next.productData.length : 0
  );

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHideAssistant(Boolean(entry?.isIntersecting));
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
      {!hideAssistant && <AssistantRossy />}
    </>
  );
};

export default RootLayout;
