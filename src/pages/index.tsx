import HeroCarousel from "@/components/HeroCarousel";
import Products from "@/components/Products";
import { ProductProps } from "../../type";
import { useDispatch } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import { setAllProducts } from "@/store/nextSlice";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import {
  getOfferProducts,
} from "@/lib/services/productCatalogService";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { getPurchaseBehaviorSnapshot, type PurchaseBehaviorSnapshot } from "@/lib/repositories/categoryInsightsRepository";

interface Props {
  productData: ProductProps[];
  behavior: PurchaseBehaviorSnapshot;
  ofertasExpress: { id: string; nombre: string; imagen: string }[];
}

export default function Home({ productData, behavior, ofertasExpress }: Props) {
  const SITE_URL = "https://rossyresinaonlineweb.vercel.app";
  const pageTitle = "Rossy Resina | Resina epóxica, moldes y pigmentos en Perú";
  const pageDesc =
    "Compra resina epóxica, moldes de silicona, pigmentos y accesorios. Envío a todo Perú y atención por WhatsApp.";
  const dispatch = useDispatch();
  const allProducts = useMemo(
    () => (productData && productData.length > 0 ? productData : []),
    [productData]
  );
  const [visibleCount, setVisibleCount] = useState(30);
  
  // Carousel refs
  const visitedCarouselRef = useRef<HTMLDivElement>(null);
  const offersCarouselRef = useRef<HTMLDivElement>(null);
  const desktopOffersRef = useRef<HTMLDivElement>(null);
  const topProductsRef = useRef<HTMLDivElement>(null);
  
  // Carousel scroll function
  const scrollMobile = (direction: 'left' | 'right', carousel: 'visited' | 'offers') => {
    const ref = carousel === 'visited' ? visitedCarouselRef : offersCarouselRef;
    if (!ref.current) return;
    
    const scrollAmount = 160; // Width of one card + gap
    const currentScroll = ref.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;
    
    ref.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };
  
  // Desktop carousel scroll function
  const scrollDesktop = (direction: 'left' | 'right', carousel: 'offers' | 'topProducts') => {
    if (carousel === 'offers' && desktopOffersRef.current) {
      const scrollAmount = 270; // Width of one desktop card + gap
      const currentScroll = desktopOffersRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      desktopOffersRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    } else if (carousel === 'topProducts' && topProductsRef.current) {
      const scrollAmount = 270; // Width of one desktop card + gap
      const currentScroll = topProductsRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      topProductsRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };
  const diversifiedProducts = useMemo(() => {
    const detectGroup = (product: ProductProps) => {
      const text = `${product.title || ""} ${product.category || ""}`.toLowerCase();
      if (/(resina|epoxi|epóxica|ep?xica|pigmento|ecoresina|kit\s*resina)/.test(text)) return "Resina";
      if (/(dije|arete|pendiente|pulsera|collar|llavero|marcapaginas|lapicero|gancho|accesorio|anillo|rosario|porta\s*vela)/.test(text)) {
        return "Accesorios";
      }
      return "Moldes";
    };

    const buckets = new Map<string, ProductProps[]>();
    allProducts.forEach((product) => {
      const key = detectGroup(product);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(product);
    });
    const keys = Array.from(buckets.keys());
    const output: ProductProps[] = [];
    let pending = true;
    while (pending) {
      pending = false;
      for (const key of keys) {
        const bucket = buckets.get(key);
        if (bucket && bucket.length > 0) {
          output.push(bucket.shift() as ProductProps);
          pending = true;
        }
      }
    }
    return output;
  }, [allProducts]);
  const productByLookup = useMemo(() => {
    const map = new Map<string, ProductProps>();
    for (const p of allProducts) {
      const idKey = String(p._id || "").trim();
      const codeKey = String(p.code || "").trim();
      if (idKey) map.set(idKey, p);
      if (codeKey) map.set(codeKey, p);
    }
    return map;
  }, [allProducts]);

  const realTopProducts = useMemo(() => {
    const keys = Array.isArray(behavior?.topProductKeys) ? behavior.topProductKeys : [];
    return keys.map((k) => productByLookup.get(String(k))).filter(Boolean) as ProductProps[];
  }, [behavior?.topProductKeys, productByLookup]);

  const offerProducts = useMemo(() => getOfferProducts(allProducts, 10), [allProducts]);

  const hasBehaviorData = !!behavior?.hasRealData;
  const remateProducts = useMemo(() => {
    const withDiscount = allProducts.filter(
      (p) =>
        typeof p.oldPrice === "number" &&
        Number(p.oldPrice) > Number(p.price || 0) &&
        Number(p.price || 0) > 0
    );
    if (withDiscount.length >= 2) {
      return [...withDiscount]
        .sort((a, b) => {
          const da = Number(a.oldPrice || 0) - Number(a.price || 0);
          const db = Number(b.oldPrice || 0) - Number(b.price || 0);
          return db - da;
        })
        .slice(0, 2);
    }
    return allProducts.slice(0, 2);
  }, [allProducts]);
  const topVisitedForHero = useMemo(() => {
    if (realTopProducts.length > 0) return realTopProducts.slice(0, 8);
    if (offerProducts.length > 0) return offerProducts.slice(0, 8);
    return allProducts.slice(0, 8);
  }, [realTopProducts, offerProducts, allProducts]);
  const mobileTopVisited = useMemo(
    () => (realTopProducts.length > 0 ? realTopProducts : allProducts).slice(0, 8),
    [realTopProducts, allProducts]
  );

  const moldProductsForHero = useMemo(() => {
    return allProducts.filter((p) => {
      const cat = String(p?.category || "").toLowerCase();
      const title = String(p?.title || "").toLowerCase();
      const code = String(p?.code || "").toLowerCase();
      return cat.includes("molde") || title.includes("molde") || code.includes("mol_");
    });
  }, [allProducts]);
  const mobileOfferProducts = useMemo(() => offerProducts.slice(0, 8), [offerProducts]);
  const interestProducts = diversifiedProducts.slice(0, visibleCount);
  const interestsRef = useRef<HTMLDivElement | null>(null);
  const offersRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canOfferScrollLeft, setCanOfferScrollLeft] = useState(false);
  const [canOfferScrollRight, setCanOfferScrollRight] = useState(false);
  const normalizeImage = (img?: string) => {
    const s = String(img || "");
    if (!s) return `${SITE_URL}/favicon-96x96.png`;
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    const fixed = u.startsWith("/") ? u : `/${u}`;
    return `${SITE_URL}${fixed}`;
  };
  const normalizeMobileImage = (img?: string) => {
    const s = String(img || "");
    if (!s) return "/favicon-96x96.png";
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    return u.startsWith("/") ? u : `/${u}`;
  };
  const keywordSet = new Set<string>([
    "resina epóxica",
    "resina uv",
    "moldes de silicona",
    "pigmentos",
    "accesorios resina",
    "manualidades",
  ]);
  allProducts.forEach((p) => {
    [p.title, p.category, p.brand].forEach((v) => {
      const t = String(v || "").trim();
      if (t) keywordSet.add(t);
    });
  });
  const keywords = Array.from(keywordSet).slice(0, 60).join(", ");
  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catalogo de productos Rossy Resina",
    numberOfItems: allProducts.length,
    itemListElement: allProducts.slice(0, 200).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/${encodeURIComponent(String(p.code || p._id))}`,
      item: {
        "@type": "Product",
        name: p.title || p.code || "Producto",
        image: normalizeImage(p.image),
        category: p.category,
        brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
      },
    })),
  };
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Rossy Resina",
    url: SITE_URL,
    description: pageDesc,
    image: `${SITE_URL}/favicon-96x96.png`,
    keywords,
  };

  useEffect(() => {
    dispatch(setAllProducts(productData));
  }, [productData, dispatch]);

  useEffect(() => {
    const el = interestsRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    const el = offersRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanOfferScrollLeft(scrollLeft > 0);
      setCanOfferScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [offerProducts.length]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/favicon-96x96.png`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
        />
      </Head>
      <main>
        {/* Hero desktop */}
        <section className="hidden md:block w-full">
          <HeroCarousel remateProducts={remateProducts} topVisitedProducts={topVisitedForHero} moldProducts={moldProductsForHero} />
        </section>

        {/* Home mobile app-like */}
        <section className="md:hidden px-4 pt-2 pb-2 space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-[#1a5f3f] to-[#40a373] p-5 text-white shadow-lg">
            <p className="text-xs uppercase tracking-wide font-medium">Tu especialista en resina</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">Materiales premium para tus creaciones</h1>
            <p className="mt-2 text-sm">Resina epóxica, moldes y pigmentos de calidad</p>
            <Link href="/search" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-[#1a5f3f] hover:scale-105 transition-transform">
              Explorar productos
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
            {["Resina Epóxica", "Moldes Premium", "Pigmentos", "Accesorios", "Kits", "Ofertas"].map((chip) => (
              <Link
                key={chip}
                href={chip === "Ofertas" ? "/productos?ofertas=1" : `/search?q=${encodeURIComponent(chip.toLowerCase())}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:border-[#1a5f3f] hover:text-[#1a5f3f] transition-colors"
              >
                {chip}
              </Link>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900">Más visitados</h2>
              <Link href="/productos" className="text-xs font-semibold text-amazon_blue">Ver todo</Link>
            </div>
            <div className="relative">
              {/* Navigation buttons */}
              <button
                onClick={() => scrollMobile('left', 'visited')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
                aria-label="Anterior"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollMobile('right', 'visited')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
                aria-label="Siguiente"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div 
                ref={visitedCarouselRef}
                className="flex gap-3 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
                style={{ scrollBehavior: 'smooth' }}
              >
                {mobileTopVisited.map((p, idx) => (
                  <Link
                    key={`m-visit-${p._id}`}
                    href={`/${p.code || p._id}`}
                    className="w-[150px] shrink-0 rounded-xl border border-gray-200 bg-white p-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="relative h-24 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={normalizeMobileImage(p.image)} alt={p.title || "Producto"} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <p className="mt-2 line-clamp-1 text-xs font-semibold text-gray-900 group-hover:text-amazon_blue transition-colors">{p.title || "Producto"}</p>
                    <p className="text-sm font-extrabold text-gray-900">S/ {Number(p.price || 0).toFixed(2)} c/unidad</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900">Ofertas relámpago</h2>
              <Link href="/productos?ofertas=1" className="text-xs font-semibold text-[#cb299e]">Ver ofertas</Link>
            </div>
          <div className="relative">
            {/* Navigation buttons */}
            <button
              onClick={() => scrollMobile('left', 'offers')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              aria-label="Anterior"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollMobile('right', 'offers')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              aria-label="Siguiente"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <Products
              productData={mobileOfferProducts}
              gridClass="grid-flow-col auto-cols-[72%] gap-3 snap-x snap-mandatory overflow-x-auto no-scrollbar pb-1 scroll-smooth"
              ref={offersCarouselRef}
            />
          </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900">Todos los productos</h2>
              <Link href="/productos" className="text-xs font-semibold text-amazon_blue">Ver catálogo</Link>
            </div>
            <Products
              productData={interestProducts.slice(0, 12)}
              gridClass="grid-cols-2 gap-3"
            />
            <div className="mt-3 flex justify-center">
              <Link
                href="/productos"
                className="inline-flex h-10 items-center justify-center rounded-full bg-amazon_blue px-5 text-sm font-semibold text-white"
              >
                Ver más productos
              </Link>
            </div>
          </div>
        </section>

        <div className="hidden md:block max-w-screen-2xl mx-auto space-y-6 md:space-y-8 pb-10 pt-6">
        <section className="px-4 md:px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold uppercase tracking-wide text-gray-900">
              Productos más comprados
            </h2>
            <Link href="/productos" className="text-sm font-semibold text-amazon_blue hover:underline">
              Ver todos
            </Link>
          </div>
          {hasBehaviorData && realTopProducts.length > 0 ? (
            <div className="relative">
              {/* Desktop navigation buttons */}
              <button
                onClick={() => scrollDesktop('left', 'topProducts')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
                aria-label="Anterior"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollDesktop('right', 'topProducts')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
                aria-label="Siguiente"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div 
                ref={topProductsRef}
                className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
                style={{ scrollBehavior: 'smooth' }}
              >
                {realTopProducts.map((product) => (
                  <div key={product._id} className="w-[200px] md:w-[250px] shrink-0">
                    <Products productData={[product]} gridClass="grid-cols-1" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-1 text-sm text-gray-600">
              Aún no hay compras confirmadas para mostrar productos más comprados.
            </div>
          )}
        </section>

        {/* Ofertas Express */}
        {ofertasExpress.length > 0 && (
        <section className="px-4 md:px-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚡</span>
            <h2 className="text-xl font-semibold uppercase tracking-wide text-orange-500">Ofertas Express</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {ofertasExpress.map((item) => (
              <div key={item.id} className="rounded-xl border border-orange-100 bg-white p-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-50">
                  <Image src={item.imagen} alt={item.nombre} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">EXPRESS</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-gray-800 text-center line-clamp-2 group-hover:text-orange-500 transition-colors">{item.nombre}</p>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Ofertas relámpago */}}
        <section className="px-4 md:px-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg"></span>
              <h2 className="text-xl font-semibold uppercase tracking-wide text-[#cb299e]">
                Ofertas relámpago
              </h2>
            </div>
            <Link href="/productos?ofertas=1" className="text-sm font-semibold text-[#cb299e] hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="relative">
            {/* Desktop navigation buttons */}
            <button
              onClick={() => scrollDesktop('left', 'offers')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollDesktop('right', 'offers')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              aria-label="Siguiente"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div 
              ref={desktopOffersRef}
              className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {offerProducts.map((product) => (
                <div key={product._id} className="w-[200px] md:w-[250px] shrink-0">
                  <Products productData={[product]} gridClass="grid-cols-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Explora tus intereses */}
        <section className="px-4 md:px-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold uppercase tracking-wide">
              Explora tus intereses
            </h2>
          </div>
          <div className="relative">
            <div
              ref={interestsRef}
              className="no-scrollbar flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-2 scroll-smooth"
            >
              {[
                "Moldes de silicona",
                "Moldes ecoresina",
                "Moldes jabones",
                "Moldes velas",
                "Resina epóxica",
                "Ecoresina",
                "Accesorios bisutería",
                "Accesorios eco resina",
                "Accesorios resina epóxica",
                "Accesorios manualidades",
              ].map((label) => (
                <span
                  key={label}
                  className="px-5 py-2 rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-800"
                >
                  {label}
                </span>
              ))}
            </div>
            {canScrollLeft && (
              <button
                type="button"
                aria-label="Ver categoras anteriores"
                onClick={() => interestsRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
                className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">Anterior</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto text-gray-700" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                aria-label="Ver más categorías"
                onClick={() => interestsRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">Siguiente</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto text-gray-700" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* Productos por intereses */}
        <section className="px-4 md:px-6">
          <Products
            productData={interestProducts}
            gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
          />
          {visibleCount < diversifiedProducts.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 30, diversifiedProducts.length))}
                className="px-6 py-3 rounded-full bg-amazon_blue text-white font-semibold hover:brightness-95"
              >
                Ver más
              </button>
            </div>
          )}
        </section>

        </div>
      </main>
    </>
  );
}

export const getServerSideProps = async () => {
  try {
    const productData = await getAllProducts();
    const behavior = await getPurchaseBehaviorSnapshot(8, 12, 180);
    const prisma = (await import("@/lib/prisma")).default as any;
    const ofertasExpress = await prisma.ofertaExpress.findMany({
      where: { activo: true },
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      select: { id: true, nombre: true, imagen: true },
    });
    return { props: { productData, behavior, ofertasExpress: JSON.parse(JSON.stringify(ofertasExpress)) } };
  } catch (e) {
    return {
      props: {
        productData: [],
        behavior: {
          hasRealData: false,
          topCategories: [],
          topProductKeys: [],
          topOfferProductKeys: [],
        } as PurchaseBehaviorSnapshot,
        ofertasExpress: [],
      },
    };
  }
};
