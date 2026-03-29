import Link from "next/link";
import { useEffect, useState } from "react";

interface ProductProps {
  _id?: string;
  code?: string;
  title?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  category?: string;
  brand?: string;
}

interface SlideItem {
  id: number;
  bg: string;
  heading: string;
  subheading: string;
  button: string;
  items: { label: string; image: string | undefined; title: string | undefined }[];
  timer?: string;
}

interface Props {
  remateProducts?: ProductProps[];
  topVisitedProducts?: ProductProps[];
  moldProducts?: ProductProps[];
}

export default function HeroCarousel({ remateProducts = [], topVisitedProducts = [], moldProducts = [] }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 20, minutes: 51, seconds: 32 });
  const [currentProducts, setCurrentProducts] = useState<{
    remate: { label: string; image: string | undefined; title: string | undefined }[];
    topVisited: { label: string; image: string | undefined; title: string | undefined }[];
    mold: { label: string; image: string | undefined; title: string | undefined }[];
  }>({
    remate: [],
    topVisited: [],
    mold: []
  });
  const totalSlides = 3;

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        let s = prev.seconds - 1;
        let m = prev.minutes;
        let h = prev.hours;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 0;
          m = 0;
          s = 0;
        }
        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (value: number) => String(value).padStart(2, "0");

  const getRandomProducts = (products: ProductProps[], count: number) => {
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, products.length));
};

useEffect(() => {
  const updateProducts = () => {
    // Filtrar productos por categoría para cada slide
    const resinaProducts = [...remateProducts, ...topVisitedProducts, ...moldProducts]
      .filter(p => {
        const text = `${p.title || ""} ${p.category || ""}`.toLowerCase();
        return text.includes('resina') || text.includes('epoxi') || text.includes('epóxica');
      });

    const moldeProducts = [...remateProducts, ...topVisitedProducts, ...moldProducts]
      .filter(p => {
        const text = `${p.title || ""} ${p.category || ""}`.toLowerCase();
        return text.includes('molde') || text.includes('silicona');
      });

    const pigmentProducts = [...remateProducts, ...topVisitedProducts, ...moldProducts]
      .filter(p => {
        const text = `${p.title || ""} ${p.category || ""}`.toLowerCase();
        return text.includes('pigmento') || text.includes('color') || text.includes('mica') || text.includes('tinta');
      });

    const newResina = getRandomProducts(resinaProducts, 4).map((item) => ({
      label: `S/${Number(item.price || 0).toFixed(2)}`,
      image: item.image,
      title: item.title,
    }));

    const newMold = getRandomProducts(moldeProducts, 4).map((item) => ({
      label: `S/${Number(item.price || 0).toFixed(2)}`,
      image: item.image,
      title: item.title,
    }));

    const newPigment = getRandomProducts(pigmentProducts, 4).map((item) => ({
      label: `S/${Number(item.price || 0).toFixed(2)}`,
      image: item.image,
      title: item.title,
    }));

    setCurrentProducts({
      remate: newResina,
      topVisited: newMold,
      mold: newPigment
    });
  };

  updateProducts();
  const interval = setInterval(updateProducts, 15000);
  return () => clearInterval(interval);
}, [remateProducts, topVisitedProducts, moldProducts]);

  const slides: SlideItem[] = [
    {
      id: 0,
      bg: "from-[#1a5f3f] via-[#2d7a5a] to-[#40a373]",
      heading: "Resina Epóxica Profesional",
      subheading: "Calidad superior para tus proyectos creativos",
      button: "Explorar productos",
      items: currentProducts.remate.length > 0 ? currentProducts.remate : [
        { label: "S/35.90", image: "/products/molde_boton1.avif", title: "Resina Epóxica Premium" },
        { label: "S/28.50", image: "/products/molde_boton2.avif", title: "Kit de Inicio Resina" },
        { label: "S/42.30", image: "/products/molde_pigmento.avif", title: "Resina UV Rápida" },
        { label: "S/18.75", image: "/products/molde_lapicero_1.avif", title: "Endurecedor Profesional" },
      ],
    },
    {
      id: 1,
      bg: "from-[#8b5cf6] via-[#a78bfa] to-[#c4b5fd]",
      heading: "Moldes de Silicona Premium",
      subheading: "Diseños exclusivos para bisutería y decoración",
      button: "Ver colección",
      items: currentProducts.topVisited.length > 0 ? currentProducts.topVisited : [
        { label: "S/15.90", image: "/products/molde_pigmento.avif", title: "Molde Geométrico" },
        { label: "S/12.50", image: "/products/molde_lapicero_1.avif", title: "Molde Floral" },
        { label: "S/22.80", image: "/products/molde_5.avif", title: "Molde Abstracto" },
        { label: "S/19.90", image: "/products/molde_6.avif", title: "Molde Corazón" },
      ],
    },
    {
      id: 2,
      bg: "from-[#0f766e] via-[#14b8a6] to-[#5eead4]",
      heading: "Pigmentos y Efectos Especiales",
      subheading: "Dale vida y color a tus creaciones",
      button: "Descubrir colores",
      items: currentProducts.mold.length > 0 ? currentProducts.mold : [
        { label: "S/18.90", image: "/products/molde_5.avif", title: "Set de Pigmentos Metálicos" },
        { label: "S/22.50", image: "/products/molde_6.avif", title: "Polvo de Mica Brillante" },
        { label: "S/16.75", image: "/products/molde_7.avif", title: "Colorantes Líquidos" },
        { label: "S/31.20", image: "/products/molde_boton1.avif", title: "Efectos Especiales" },
      ],
    },
  ];

  const activeSlide = slides[slideIndex];

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background with sophisticated gradient */}
      <div className={`relative h-[260px] md:h-[320px] w-full overflow-hidden bg-gradient-to-br ${activeSlide.bg}`}>
        {/* Multiple overlay layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
            backgroundSize: '100% 100%'
          }} />
        </div>
        <div className="relative mx-auto flex h-full max-w-screen-2xl items-center px-6 md:px-8 pt-0">
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-12 items-center">
            {/* Content section with enhanced styling */}
            <div className="col-span-12 md:col-span-5 text-center md:text-left pl-10 md:pl-12">
              <div className="space-y-1 md:space-y-2">
                {/* Enhanced subheading */}
                <div className="inline-flex items-center">
                  <div className="h-px w-8 bg-white/40 mr-3" />
                  <p className="text-sm md:text-base font-medium text-white/95 tracking-wider uppercase letter-spacing-2">{activeSlide.subheading}</p>
                  <div className="h-px w-8 bg-white/40 ml-3" />
                </div>
                
                {/* Enhanced heading */}
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                  {activeSlide.heading}
                </h2>
                
                {/* Enhanced timer */}
                {activeSlide.timer && (
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <span className="text-white/90 text-xs md:text-sm font-medium">La oferta termina en:</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                        <p className="text-lg md:text-2xl font-black text-white font-mono">{activeSlide.timer}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced CTA button */}
                <div className="pt-2">
                  <Link
                    href="/productos"
                    className="group inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm md:text-base font-bold text-gray-900 transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-2xl shadow-xl"
                    onMouseEnter={() => setIsAutoPlay(false)}
                    onMouseLeave={() => setIsAutoPlay(true)}
                  >
                    <span className="relative z-10">{activeSlide.button}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                    <svg className="ml-2 w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Enhanced products section */}
            <div className="col-span-12 md:col-span-7 flex justify-center items-center">
              <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
                {activeSlide.items.map((item: any, idx: number) => (
                  <div key={idx} className="group relative w-[120px] md:w-[160px]">
                    {/* Enhanced product card */}
                    <div className="relative rounded-2xl border border-white/30 bg-white/95 backdrop-blur-md p-2 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 hover:-translate-y-2">
                      {/* Product image with enhanced container */}
                      <div className="relative h-28 md:h-40 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.title || item.label} 
                          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110" 
                        />
                        {/* Subtle shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                      </div>
                      
                      {/* Enhanced product info */}
                      <div className="mt-3 text-center">
                        <p className="text-sm md:text-base font-black text-gray-900 group-hover:text-amazon_blue transition-colors duration-300">{item.label}</p>
                        {item.title && (
                          <p className="text-xs md:text-sm text-gray-600 truncate mt-1 group-hover:text-gray-800 transition-colors duration-300">
                            {item.title}
                          </p>
                        )}
                      </div>
                      
                      {/* Floating indicator */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amazon_blue rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced navigation indicators */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
          {slides.map((slide) => (
            <button
              key={slide.id}
              onClick={() => {
                setSlideIndex(slide.id);
                setIsAutoPlay(false);
                setTimeout(() => setIsAutoPlay(true), 6000);
              }}
              className={`h-3 w-12 rounded-full transition-all duration-300 ${
                slideIndex === slide.id 
                  ? "bg-white shadow-xl scale-110" 
                  : "bg-white/40 hover:bg-white/60 hover:scale-105"
              }`}
              aria-label={`Ir al banner ${slide.id + 1}`}
            />
          ))}
        </div>

        {/* Enhanced navigation buttons */}
        <button
          onClick={() => {
            setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 6000);
          }}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/10 backdrop-blur-md p-3 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/20"
          aria-label="Anterior banner"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => {
            setSlideIndex((prev) => (prev + 1) % totalSlides);
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 6000);
          }}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/10 backdrop-blur-md p-3 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/20"
          aria-label="Siguiente banner"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
