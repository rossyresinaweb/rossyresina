import FormattedPrice from "@/components/FormattedPrice";
import { addToCart, addToFavorite } from "@/store/nextSlice";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { HiShoppingCart } from "react-icons/hi";
import { useDispatch } from "react-redux";
import type { ProductProps } from "../../type";
import Head from "next/head";
import { useRouter } from "next/router";
import productData from "../data/products.json";

interface Props {
  product: ProductProps | null;
  recs: ProductProps[];
}

const DynamicPage = ({ product, recs }: Props) => {
  const [qty, setQty] = useState(1);
  const [activeSection, setActiveSection] = useState<"desc" | "details" | "shipping">("desc");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const dispatch = useDispatch();
  const router = useRouter();

  const normalizeImage = (img?: string) => {
    const s = String(img || "");
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png";
  };

  const shippingText = useMemo(() => {
    const price = Number(product?.price) || 0;
    return price >= 120 ? "Envío Gratis" : "Envío desde S/ 10.00";
  }, [product]);

  const categorySlug = useMemo(() => {
    const cat = String(product?.category || "");
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower.includes("resina")) return "resina";
    return lower.replace(/\s+/g, "-");
  }, [product]);

  const waHref = useMemo(() => {
    const title = product?.title || product?.code || "Producto";
    const price = Number(product?.price) || 0;
    const text = `Mira este producto: ${title} — S/ ${price.toFixed(2)}\n${product?.description || ""}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [product]);

  const productImages = useMemo(() => {
    const list = Array.isArray(product?.images) ? product.images : [];
    const base = product?.image ? [product.image] : [];
    const combined = [...base, ...(list ?? [])]
      .map((img) => normalizeImage(img))
      .filter(Boolean);
    return combined.length > 0 ? Array.from(new Set(combined)) : ["/favicon-96x96.png"];
  }, [product]);

  const mainImage = activeImage || productImages[0];
  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const addProductToCart = (quantity: number) => {
    if (!product) return;
    dispatch(
      addToCart({
        _id: product._id,
        brand: product.brand,
        category: product.category,
        description: product.description,
        image: product.image,
        isNew: product.isNew,
        oldPrice: product.oldPrice,
        price: product.price,
        title: product.title,
        quantity,
      })
    );
  };

  const handleBuyNow = () => {
    addProductToCart(qty);
    router.push("/checkout");
  };

  const pageTitle = product?.title ? `${product.title} | Rossy Resina` : "Producto | Rossy Resina";
  const pageDesc = product?.description || "Descubre productos de resina, moldes y pigmentos en Rossy Resina.";
  const pageImage = product?.image
    ? (String(product.image).startsWith("/") ? product.image : `/${product.image}`)
    : "/favicon-96x96.png";
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 md:py-10">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={pageImage} />
      </Head>
      {!product ? (
        <div className="w-full flex flex-col gap-4 items-center justify-center py-20">
          <p className="text-lg font-medium">Producto no encontrado.</p>
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <>
<div className="w-full grid md:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-xl p-4">
              <div
                className="flex items-center justify-center bg-white rounded-lg relative overflow-hidden group"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleZoomMove}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${mainImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: isZooming ? "220%" : "contain",
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    transition: "background-size 150ms ease",
                  }}
                />
                <Image
                  src={mainImage}
                  alt={`Imagen de ${product.title || "producto"}`}
                  width={620}
                  height={620}
                  className="object-contain select-none pointer-events-none"
                  draggable={false}
                />
                <div className="w-12 h-24 absolute bottom-6 right-0 border-[1px] border-gray-300 bg-white rounded-md flex flex-col translate-x-20 group-hover:-translate-x-2 transition-transform duration-300">
                  <span
                    onClick={() => addProductToCart(1)}
                    className="w-full h-full border-b-[1px] border-b-gray-300 flex items-center justify-center text-xl bg-transparent hover:bg-brand_teal cursor-pointer duration-300"
                  >
                    <HiShoppingCart />
                  </span>
                  <span
                    onClick={() =>
                      dispatch(
                        addToFavorite({
                          _id: product._id,
                          brand: product.brand,
                          category: product.category,
                          description: product.description,
                          image: product.image,
                          isNew: product.isNew,
                          oldPrice: product.oldPrice,
                          price: product.price,
                          title: product.title,
                          quantity: 1,
                        })
                      )
                    }
                    className="w-full h-full border-b-[1px] border-b-gray-300 flex items-center justify-center text-xl bg-transparent hover:bg-brand_teal cursor-pointer duration-300"
                  >
                    <FaHeart />
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {productImages.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 rounded border ${mainImage === img ? "border-amazon_blue" : "border-gray-200"} bg-white`}
                    aria-label="Cambiar imagen"
                  >
                    <Image src={img} alt="Miniatura del producto" width={64} height={64} className="object-contain" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 md:gap-5 md:sticky md:top-20">
              <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="uppercase tracking-wide">{product.category}</span>
                  <span>•</span>
                  <span>{product.brand}</span>
                  {product.isNew && <span className="ml-1 px-2 py-0.5 rounded-full bg-brand_teal text-black">Nuevo</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold mt-2">
                  {product.title || product.code || "Producto"}
                </h1>
                {product.code && (
                  <p className="text-xs text-gray-500 mt-1">Código: {product.code}</p>
                )}
                <div className="mt-3">
                  <p className="text-base text-gray-600 flex items-center gap-2">
                    <span className="text-lg text-amazon_blue font-semibold">
                      <FormattedPrice amount={Number(product.price) || 0} />
                    </span>
                    {typeof product.oldPrice === "number" && product.oldPrice > product.price && (
                      <span className="text-sm line-through text-gray-400">
                        <FormattedPrice amount={Number(product.oldPrice) || 0} />
                      </span>
                    )}
                  </p>
                  {typeof product.oldPrice === "number" && product.oldPrice > product.price && (
                    <p className="text-sm text-gray-500">
                      Tu ahorro: <FormattedPrice amount={(Number(product.oldPrice) || 0) - (Number(product.price) || 0)} />
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">{shippingText}</p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center justify-between border border-gray-300 px-3 py-1 rounded-full w-28 shadow">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-lg">-</button>
                    <span className="font-semibold">{qty}</span>
                    <button onClick={() => setQty((q) => q + 1)} className="text-lg">+</button>
                  </div>
                  <a href={waHref} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 rounded border border-brand_green text-brand_green hover:bg-brand_green hover:text-white">
                    Compartir por WhatsApp
                  </a>
                </div>
                <div className="mt-5 grid gap-2">
                  <button
                    onClick={() => addProductToCart(qty)}
                    className="w-full h-12 rounded-lg text-base font-semibold bg-gradient-to-r from-brand_purple via-brand_pink to-brand_teal text-white hover:brightness-105 duration-300"
                  >
                    Agregar al carrito
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full h-12 rounded-lg text-base font-semibold border border-amazon_blue text-amazon_blue hover:bg-amazon_blue hover:text-white duration-300"
                  >
                    Comprar ahora
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-600 grid gap-1">
                  <p>✅ Pago seguro</p>
                  <p>✅ Atención por WhatsApp</p>
                  <p>✅ Envíos a todo el Perú</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-5 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => setActiveSection("desc")}
                    className={`text-sm font-semibold ${activeSection === "desc" ? "text-amazon_blue" : "text-gray-500"}`}
                  >
                    Descripción
                  </button>
                  <button
                    onClick={() => setActiveSection("details")}
                    className={`text-sm font-semibold ${activeSection === "details" ? "text-amazon_blue" : "text-gray-500"}`}
                  >
                    Detalles
                  </button>
                  <button
                    onClick={() => setActiveSection("shipping")}
                    className={`text-sm font-semibold ${activeSection === "shipping" ? "text-amazon_blue" : "text-gray-500"}`}
                  >
                    Envíos y cambios
                  </button>
                </div>
                {activeSection === "desc" && (
                  <p className="text-sm text-gray-700">
                    {product.description || "Producto de alta calidad para tus proyectos en resina."}
                  </p>
                )}
                {activeSection === "details" && (
                  <div className="text-sm text-gray-700 grid gap-1">
                    <p>Marca: {product.brand}</p>
                    <p>Categoría: {product.category}</p>
                    {product.measure && <p>Medida: {product.measure}</p>}
                    {product.code && <p>Código: {product.code}</p>}
                  </div>
                )}
                {activeSection === "shipping" && (
                  <div className="text-sm text-gray-700 grid gap-1">
                    <p>{shippingText}. Coordinamos por WhatsApp.</p>
                    <p>Cambios o devoluciones dentro de 7 días, producto sellado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Te puede interesar</h2>
            {recs.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recs.map((p) => (
                <Link key={`${p._id}-${p.code || p.title}`} href={{ pathname: `/${p.code || p._id}`, query: { ...p } }} className="bg-white rounded-lg p-3 shadow hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <Image src={normalizeImage(p.image)} alt={p.title} width={64} height={64} className="rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                        <p className="text-sm text-amazon_blue font-semibold"><FormattedPrice amount={p.price} /></p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No hay productos relacionados.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DynamicPage;

export const getServerSideProps = async (ctx: any) => {
  const id = String(ctx?.params?._id || "").trim();
  const all: ProductProps[] = Array.isArray(productData) ? (productData as ProductProps[]) : [];
  const product =
    all.find((p) => String(p._id) === id) ||
    all.find((p) => String(p.code || "").toLowerCase() === id.toLowerCase()) ||
    null;
  const recs = product
    ? all.filter((p) => String(p.category) === String(product.category) && String(p._id) !== String(product._id)).slice(0, 4)
    : [];
  return { props: { product, recs } };
};
