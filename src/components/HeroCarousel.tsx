import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  remateProducts?: any[];
  topVisitedProducts?: any[];
}

export default function HeroCarousel({ remateProducts = [], topVisitedProducts = [] }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [countdown, setCountdown] = useState({ hours: 20, minutes: 51, seconds: 32 });
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

  const slides = [
    {
      id: 0,
      bg: "from-[#DD1F26] via-[#ED2330] to-[#FF4E58]",
      heading: "Dto. Bienvenida",
      subheading: "Especial para nuevo comprador",
      button: "Comprar",
      items: [
        { label: "S/3.98", image: "/products/molde_boton1.avif" },
        { label: "S/3.98", image: "/products/molde_boton2.avif" },
      ],
    },
    {
      id: 1,
      bg: "from-[#fff9e6] to-[#f8f2d2]",
      heading: "Decoración creativa",
      subheading: "Ideas innovadoras para casa",
      button: "Comprar",
      items: [
        { label: "S/8.18", image: "/products/molde_pigmento.avif" },
        { label: "S/3.53", image: "/products/molde_lapicero_1.avif" },
      ],
    },
    {
      id: 2,
      bg: "from-[#ff0062] via-[#ff3a8a] to-[#ff69aa]",
      heading: "HASTA -80%",
      subheading: "La Promo Termina en:",
      timer: `${formatTime(countdown.hours)} : ${formatTime(countdown.minutes)} : ${formatTime(countdown.seconds)}`,
      button: "Ver promo",
      items: [
        { label: "S/105", image: "/products/molde_5.avif" },
        { label: "S/70", image: "/products/molde_6.avif" },
        { label: "S/45", image: "/products/molde_7.avif" },
      ],
    },
  ];

  const activeSlide = slides[slideIndex];

  return (
    <section className="relative w-full overflow-hidden">
      <div className={`relative h-[340px] md:h-[420px] w-full overflow-hidden bg-gradient-to-r ${activeSlide.bg}`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 md:px-8">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-12 items-center">
            <div className="col-span-12 md:col-span-5 text-center md:text-left">
              <p className="text-lg md:text-xl font-bold text-white/90 tracking-wider mb-2">{activeSlide.subheading}</p>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3">{activeSlide.heading}</h2>
              {activeSlide.timer && (
                <p className="text-2xl md:text-3xl font-extrabold text-white mb-3">{activeSlide.timer}</p>
              )}
              <Link
                href="/productos"
                className="inline-flex items-center justify-center rounded-lg bg-black/90 px-6 py-2.5 text-sm md:text-base font-bold text-white transition hover:bg-black"
                onMouseEnter={() => setIsAutoPlay(false)}
                onMouseLeave={() => setIsAutoPlay(true)}
              >
                {activeSlide.button}
              </Link>
            </div>

            <div className="col-span-12 md:col-span-7 flex justify-center md:justify-end gap-3">
              {activeSlide.items.map((item, idx) => (
                <div key={idx} className="relative w-[120px] md:w-[160px] rounded-xl border border-white/30 bg-white/90 p-2 shadow-lg">
                  <div className="h-24 md:h-28 overflow-hidden rounded-lg bg-gray-100">
                    <img src={item.image} alt={item.label} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 text-sm font-bold text-gray-900 text-center">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide) => (
            <button
              key={slide.id}
              onClick={() => {
                setSlideIndex(slide.id);
                setIsAutoPlay(false);
                setTimeout(() => setIsAutoPlay(true), 6000);
              }}
              className={`h-2 w-8 rounded-full transition-all ${slideIndex === slide.id ? "bg-white" : "bg-white/40"}`}
              aria-label={`Ir al banner ${slide.id + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 6000);
          }}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          aria-label="Anterior banner"
        >
          ‹
        </button>
        <button
          onClick={() => {
            setSlideIndex((prev) => (prev + 1) % totalSlides);
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 6000);
          }}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          aria-label="Siguiente banner"
        >
          ›
        </button>
      </div>
    </section>
  );
}
