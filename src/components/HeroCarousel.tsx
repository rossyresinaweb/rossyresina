import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductProps } from "../../type";

interface Props {
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
}

export default function HeroCarousel({ remateProducts = [], topVisitedProducts = [] }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const totalSlides = 4;

  const normImg = (s?: string) => {
    const t = String(s || "");
    if (!t) return "/favicon-96x96.png";
    let u = t.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    if (!u.startsWith("/")) u = "/" + u;
    return u;
  };

  const hasProducts = remateProducts.length > 0;
  const featured = remateProducts.slice(0, 3);
  const leftProduct = featured[0];
  const rightTop = featured[1] || featured[0];
  const rightBottom = featured[2] || featured[1] || featured[0];
  const nextFeatured = remateProducts.slice(3, 7);
  const secondLeft = nextFeatured[0] || featured[0];
  const secondCenter = nextFeatured[1] || featured[1] || featured[0];
  const secondRight = nextFeatured[2] || featured[2] || featured[1] || featured[0];
  const thirdFeatured = (topVisitedProducts.length > 0 ? topVisitedProducts : remateProducts).slice(0, 5);

  const discountPercent = (() => {
    if (!leftProduct) return null;
    const oldPrice = Number(leftProduct.oldPrice || 0);
    const price = Number(leftProduct.price || 0);
    if (oldPrice <= price || oldPrice <= 0) return null;
    return Math.max(1, Math.round(((oldPrice - price) / oldPrice) * 100));
  })();

  /* Componente para tarjeta de producto con estilo profesional */
  const ProductCard = ({ p, isFeature = false }: { p?: ProductProps; isFeature?: boolean }) => {
    if (!p) return null;
    const src = normImg(p.image);
    const isReference =
      !p.image ||
      src.includes("sliderImg_") ||
      src.includes("favicon-96x96.png") ||
      src.includes("favicon");
    
    const oldPrice = Number(p.oldPrice || 0);
    const price = Number(p.price || 0);
    const discount = oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

    return (
      <Link
        href={`/${p.code || p._id}`}
        className={`group relative overflow-hidden rounded-xl bg-white transition duration-300 hover:shadow-2xl ${isFeature ? 'shadow-2xl' : 'shadow-lg'}`}
      >
        <div className={`relative overflow-hidden bg-gray-100 ${isFeature ? 'h-80' : 'h-48'}`}>
          {isReference ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-400">
              Producto en carga
            </div>
          ) : (
            <Image 
              src={src} 
              alt={p.title || "Producto"} 
              fill 
              className="object-cover transition duration-300 group-hover:scale-110"
            />
          )}
          
          {discount > 0 && (
            <div className="absolute left-3 top-3 rounded-lg bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
              -{discount}%
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
        </div>

        <div className={`p-3 ${isFeature ? 'p-4' : ''}`}>
          <p className="line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-blue-600">
            {p.title || p.code || "Producto"}
          </p>
          
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 md:text-xl">
              S/{Number(p.price || 0).toFixed(2)}
            </span>
            {oldPrice > price && (
              <span className="text-sm font-semibold text-gray-400 line-through">
                S/{oldPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  const isReferenceProductImage = (p?: ProductProps): boolean => {
    if (!p) return true;
    const src = normImg(p.image);
    return !p.image || src.includes("sliderImg_") || src.includes("favicon-96x96.png") || src.includes("favicon");
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Slide container con transiciones suaves */}
      <div className="relative h-[280px] md:h-[400px] lg:h-[480px] w-full overflow-hidden bg-white">
        {slideIndex === 0 && (
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
            {/* Decorativos */}
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
            
            <div className="relative mx-auto h-full max-w-7xl px-4 py-6 md:px-8 md:py-8 flex items-center">
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 items-center">
                {/* Contenido text */}
                <div className="z-10 text-white">
                  <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 backdrop-blur-sm mb-4">
                    <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">📅 EVENTO EN VIVO</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                    TALLER <span className="text-cyan-300">RESINERO</span>
                  </h1>
                  
                  <p className="mt-3 text-lg md:text-xl text-blue-100 font-semibold">
                    Aprende resina epoxica desde cero
                  </p>
                  
                  <p className="mt-2 text-sm md:text-base text-white/85 max-w-md">
                    Técnicas profesionales, mezcla correcta y acabados que venden. Sabado 28 de marzo - 8:00 p.m.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur px-3 py-2 text-xs md:text-sm font-semibold text-white">
                      <span>🎓</span> Clase por Google Meet
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur px-3 py-2 text-xs md:text-sm font-semibold text-white">
                      <span>⚡</span> Cupos limitados
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur px-3 py-2 text-xs md:text-sm font-semibold text-white">
                      <span>💰</span> S/ 10.00
                    </div>
                  </div>
                  
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/capacitaciones-preview"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 px-6 py-3 font-bold text-gray-900 transition duration-300 hover:shadow-lg hover:scale-105"
                    >
                      ✓ Inscribirme ahora
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 font-bold text-white transition duration-300 hover:bg-white/20 backdrop-blur"
                    >
                      ℹ Más información
                    </Link>
                  </div>
                </div>

                {/* Imagen/Características */}
                <div className="hidden md:flex flex-col gap-3">
                  <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-200 mb-3">✨ LO QUE APRENDERÁS</p>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-300 font-bold">✓</span>
                        <span>Técnicas base para trabajar con resina</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-300 font-bold">✓</span>
                        <span>Proporciones y mezclado sin errores</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-300 font-bold">✓</span>
                        <span>Acabados profesionales para vender</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-300 font-bold">✓</span>
                        <span>Recomendaciones de materiales</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {slideIndex === 1 && (
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-gradient-to-br from-red-50 via-white to-orange-50">
            <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-red-200/30 blur-3xl" />
            
            <div className="relative mx-auto h-full max-w-7xl px-4 py-6 md:px-8 md:py-8 flex items-center">
              <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3 items-center">
                {/* Producto izquierda */}
                {leftProduct && !isReferenceProductImage(leftProduct) && (
                  <div className="hidden md:flex justify-end">
                    <div className="relative">
                      <div className="rounded-2xl overflow-hidden shadow-2xl">
                        <ProductCard p={leftProduct} isFeature={true} />
                      </div>
                      {discountPercent !== null && (
                        <div className="absolute -bottom-4 -right-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-2xl font-extrabold text-white shadow-lg border-4 border-white">
                          -{discountPercent}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Centro - Contenido principal */}
                <div className="z-10 text-center">
                  <div className="inline-flex items-center rounded-full bg-red-100 px-4 py-1.5 text-xs md:text-sm font-bold text-red-700 uppercase tracking-wider mb-3">
                    🔥 OFERTAS Limitadas
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                    PRODUCTOS EN <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">OFERTA</span>
                  </h2>
                  
                  <p className="mt-3 text-base md:text-lg text-gray-700 font-semibold max-w-lg mx-auto">
                    Resina epóxica, moldes y accesorios resineros disponibles con descuentos especiales
                  </p>
                  
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs md:text-sm font-semibold text-green-700">
                      ✈️ Envío a todo Perú
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs md:text-sm font-semibold text-blue-700">
                      ⚡ Stock limitado
                    </div>
                  </div>
                  
                  <Link
                    href="/productos?ofertas=1"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-8 py-3 md:py-4 font-bold text-white transition duration-300 hover:shadow-xl hover:scale-105"
                  >
                    🛒 Ver todas las ofertas
                  </Link>
                </div>

                {/* Productos derecha */}
                <div className="hidden md:flex flex-col gap-3 justify-center">
                  {rightTop && <ProductCard p={rightTop} />}
                  {rightBottom && <ProductCard p={rightBottom} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {slideIndex === 2 && (
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-gradient-to-br from-amber-50 via-white to-yellow-50">
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-yellow-300/20 blur-3xl" />
            
            <div className="relative mx-auto h-full max-w-7xl px-4 py-6 md:px-8 md:py-8 flex items-center">
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 items-center">
                <div className="z-10">
                  <div className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-xs md:text-sm font-bold text-amber-700 uppercase tracking-wider mb-3">
                    🎨 Moldes profesionales
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                    Moldes de <span className="text-amber-600">Silicona</span>
                  </h2>
                  
                  <p className="mt-3 text-base md:text-lg text-gray-700 font-semibold">
                    Crea piezas únicas y acelera tu producción
                  </p>
                  
                  <div className="mt-4 space-y-2 text-sm md:text-base text-gray-600">
                    <p className="flex items-center gap-2"><span className="text-amber-600">✓</span> Silicona flexible premium</p>
                    <p className="flex items-center gap-2"><span className="text-amber-600">✓</span> Desmolde fácil y seguro</p>
                    <p className="flex items-center gap-2"><span className="text-amber-600">✓</span> Acabado profesional</p>
                  </div>
                  
                  <Link
                    href="/search?q=molde"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-gray-900 transition duration-300 hover:shadow-lg hover:scale-105"
                  >
                    🔍 Explorar moldes
                  </Link>
                </div>

                {secondLeft && <ProductCard p={secondLeft} isFeature={true} />}
                {secondCenter && <ProductCard p={secondCenter} isFeature={true} />}
              </div>
            </div>
          </div>
        )}

        {slideIndex === 3 && (
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900">
            <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
            
            <div className="relative mx-auto h-full max-w-7xl px-4 py-6 md:px-8 md:py-8 flex items-center">
              <div className="grid w-full grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="z-10 md:col-span-1">
                  <div className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs md:text-sm font-bold text-white uppercase tracking-wider mb-3 backdrop-blur">
                    ⭐ Top visitados
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    Más buscados
                  </h3>
                  
                  <p className="mt-2 text-sm md:text-base text-white/90 font-semibold">
                    Lo que las resineras quieren
                  </p>
                  
                  <Link
                    href="/productos"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2 font-bold text-purple-700 transition duration-300 hover:shadow-lg hover:scale-105 text-sm md:text-base"
                  >
                    Ver todos →
                  </Link>
                </div>

                {/* Carrusel horizontal de productos */}
                <div className="md:col-span-4 overflow-x-auto no-scrollbar">
                  <div className="flex gap-3 min-w-max pb-2">
                    {thirdFeatured.map((p) => (
                      <div key={`visited-${p._id}`} className="flex-shrink-0 w-40 md:w-48">
                        <ProductCard p={p} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de navegación mejorados */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex justify-center items-center gap-2 py-4 md:py-6 bg-gradient-to-t from-black/20 to-transparent">
        {/* Dots indicadores */}
        <div className="flex items-center gap-2 md:gap-3">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => {
                setSlideIndex(idx);
                setIsAutoPlay(false);
                setTimeout(() => setIsAutoPlay(true), 8000);
              }}
              onMouseEnter={() => setIsAutoPlay(false)}
              onMouseLeave={() => setIsAutoPlay(true)}
              className={`transition-all duration-300 rounded-full ${
                slideIndex === idx
                  ? 'w-8 md:w-10 h-2 md:h-2.5 bg-white'
                  : 'w-2 md:w-2.5 h-2 md:h-2.5 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir al banner ${idx + 1}`}
              aria-current={slideIndex === idx}
            />
          ))}
        </div>

        {/* Botones de navegación */}
        <div className="hidden md:flex items-center gap-2 ml-4 md:ml-6">
          <button
            onClick={prevSlide}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            className="rounded-full p-2 transition duration-300 bg-white/20 hover:bg-white/40 text-white"
            aria-label="Banner anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white/80 text-sm font-semibold px-2 md:px-3">
            {slideIndex + 1} / {totalSlides}
          </span>
          <button
            onClick={nextSlide}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
            className="rounded-full p-2 transition duration-300 bg-white/20 hover:bg-white/40 text-white"
            aria-label="Siguiente banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
