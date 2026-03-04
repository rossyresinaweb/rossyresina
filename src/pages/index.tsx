import HeroCarousel from "@/components/HeroCarousel";
import Products from "@/components/Products";
import { ProductProps } from "../../type";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setAllProducts } from "@/store/nextSlice";
import Link from "next/link";
import fs from "fs";
import path from "path";
import Image from "next/image";
import Head from "next/head";

interface Props {
  productData: ProductProps[];
}

export default function Home({ productData }: Props) {
  const SITE_URL = "https://rossyresinaonlineweb.vercel.app";
  const pageTitle = "Rossy Resina | Resina epóxica, moldes y pigmentos en Perú";
  const pageDesc =
    "Compra resina epóxica, moldes de silicona, pigmentos y accesorios. Envío a todo Perú y atención por WhatsApp.";
  const dispatch = useDispatch();
  const featuredProducts = productData.slice(0, 12);

  useEffect(() => {
    dispatch(setAllProducts({ allProducts: productData }));
  }, [productData, dispatch]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/favicon-96x96.png`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Head>
      <main>
        <div className="max-w-screen-2xl mx-auto space-y-10 md:space-y-12 pb-10">
        {/* Hero */}
        <section className="px-4 md:px-6 mt-4 md:mt-6">
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <HeroCarousel />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/productos" className="px-5 py-2 rounded-md bg-amazon_blue text-white hover:brightness-95 font-semibold">Ver catálogo</Link>
            <Link href="/categoria/resina" className="px-5 py-2 rounded-md border border-gray-300 hover:bg-gray-50 font-semibold">Comprar resinas</Link>
          </div>
        </section>

        {/* Categorías */}
        <section className="px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Categorías principales</h2>
            <Link href="/productos" className="text-sm text-amazon_blue hover:underline">Ver todas</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Resinas", img: "/sliderImg_2.svg", href: "/categoria/resina" },
              { label: "Moldes", img: "/sliderImg_3.svg", href: "/categoria/moldes-de-silicona" },
              { label: "Pigmentos", img: "/sliderImg_1.svg", href: "/categoria/pigmentos" },
              { label: "Accesorios", img: "/sliderImg_6.svg", href: "/categoria/accesorios" },
            ].map((c) => (
              <Link key={c.label} href={c.href} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="relative h-28">
                  <Image src={c.img} alt={c.label} fill className="object-cover" />
                </div>
                <div className="px-3 py-2 text-sm font-semibold">{c.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos destacados */}
        <section className="px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Productos destacados</h2>
            <Link href="/productos" className="text-sm text-amazon_blue hover:underline">Ver todos</Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <Products productData={featuredProducts} gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" />
          </div>
        </section>

        {/* Beneficios */}
        <section className="px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Envío a todo Perú", desc: "Coordinamos por WhatsApp" },
              { title: "Pago seguro", desc: "Yape, Plin y transferencia" },
              { title: "Atención directa", desc: "Respuesta rápida" },
            ].map((b) => (
              <div key={b.title} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="font-semibold">{b.title}</p>
                <p className="text-sm text-gray-600 mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps = async () => {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "products.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const productData = JSON.parse(raw);
    return { props: { productData } };
  } catch (e) {
    return { props: { productData: [] } };
  }
};


