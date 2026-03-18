import FormattedPrice from "@/components/FormattedPrice";
import { addToCart } from "@/store/nextSlice";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { useDispatch } from "react-redux";
import type { ProductProps } from "../../type";
import Head from "next/head";
import { useRouter } from "next/router";
import Products from "@/components/Products";
import { readCatalog } from "@/lib/catalogStore";
import { useSession, signIn } from "next-auth/react";
import Script from "next/script";

interface Props {
  product: ProductProps | null;
  recs: ProductProps[];
}

type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

const DynamicPage = ({ product, recs }: Props) => {
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [salesCount, setSalesCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();

  const normalizeImage = (img?: string) => {
    const s = String(img || "");
    const u = s.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    const fixed = u
      .replace(/Ã¡/g, "a")
      .replace(/Ã©/g, "e")
      .replace(/Ã­/g, "i")
      .replace(/Ã³/g, "o")
      .replace(/Ãº/g, "u")
      .replace(/Ã±/g, "n")
      .replace(/Ã/g, "A")
      .replace(/Ã‰/g, "E")
      .replace(/Ã/g, "I")
      .replace(/Ã“/g, "O")
      .replace(/Ãš/g, "U")
      .replace(/Ã‘/g, "N");
    return fixed ? (fixed.startsWith("/") ? fixed : "/" + fixed) : "/favicon-96x96.png";
  };

  const shippingText = useMemo(() => {
    const price = Number(product?.price) || 0;
    return price >= 120 ? "Envio gratis" : "Envio desde S/ 10.00";
  }, [product]);

  const waHref = useMemo(() => {
    const title = product?.title || product?.code || "Producto";
    const price = Number(product?.price) || 0;
    const text = `Mira este producto: ${title} — S/ ${price.toFixed(2)}\n${product?.description || ""}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [product]);

  const waBuyHref = useMemo(() => {
    const title = product?.title || product?.code || "Producto";
    const price = Number(product?.price) || 0;
    const total = price * qty;
    const text = `Hola Rossy Resina, quiero comprar:\nProducto: ${title}\nCantidad: ${qty}\nPrecio unitario: S/ ${price.toFixed(2)}\nTotal estimado: S/ ${total.toFixed(2)}\n\nPor favor, ayudame con el pedido.`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [product, qty]);

  const productImages = useMemo(() => {
    const list = Array.isArray(product?.images) ? product.images : [];
    const base = product?.image ? [product.image] : [];
    const combined = [...base, ...(list ?? [])]
      .map((img) => normalizeImage(img))
      .filter(Boolean);
    return combined.length > 0 ? Array.from(new Set(combined)) : ["/favicon-96x96.png"];
  }, [product]);

  const mainImage = activeImage || productImages[0];

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

  useEffect(() => {
    const id = String(product?._id || "").trim();
    if (!id) {
      setSalesCount(0);
      return;
    }
    let active = true;
    fetch(`/api/products/${encodeURIComponent(id)}/metrics`)
      .then((r) => (r.ok ? r.json() : { cartAdds: 0, paidUnits: 0 }))
      .then((data) => {
        if (!active) return;
        setSalesCount(Math.max(0, Number(data?.salesCount || 0)));
      })
      .catch(() => {
        if (!active) return;
        setSalesCount(0);
      });
    return () => {
      active = false;
    };
  }, [product?._id]);

  useEffect(() => {
    const id = String(product?._id || "").trim();
    if (!id) {
      setReviews([]);
      return;
    }
    let active = true;
    setLoadingReviews(true);
    fetch(`/api/reviews?productId=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (!active) return;
        setReviews(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!active) return;
        setReviews([]);
      })
      .finally(() => {
        if (!active) return;
        setLoadingReviews(false);
      });
    return () => {
      active = false;
    };
  }, [product?._id]);

  const reviewCount = reviews.length;
  const reviewAverage = useMemo(() => {
    if (!reviewCount) return 0;
    return (
      reviews.reduce((sum, r) => sum + Math.max(1, Math.min(5, Number(r.rating || 0))), 0) /
      reviewCount
    );
  }, [reviews, reviewCount]);

  const handleBuyNow = () => {
    addProductToCart(qty);
    router.push("/checkout");
  };

  const pageTitle = product?.title ? `${product.title} | Rossy Resina` : "Producto | Rossy Resina";
  const pageDesc = product?.description || "Descubre productos de resina, moldes y pigmentos en Rossy Resina.";
  const pageImage = product?.image
    ? (String(product.image).startsWith("/") ? product.image : `/${product.image}`)
    : "/favicon-96x96.png";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://rossyresinaonlineweb.vercel.app";
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title || product.code || "Producto",
        image: [pageImage.startsWith("http") ? pageImage : `${siteUrl}${pageImage}`],
        description: product.description || "",
        sku: String(product.code || product._id || ""),
        category: product.category || "",
        brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "PEN",
          price: Number(product.price || 0).toFixed(2),
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/${encodeURIComponent(String(product.code || product._id))}`,
        },
        aggregateRating:
          reviewCount > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: Number(reviewAverage || 0).toFixed(1),
                reviewCount,
              }
            : undefined,
      }
    : null;

  const fmtReviewDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(+d)) return "";
    return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
  };

  const submitReview = async () => {
    if (!product) return;
    setReviewError("");
    const comment = reviewComment.trim();
    if (comment.length < 3) {
      setReviewError("Escribe un comentario de al menos 3 caracteres.");
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: String(product._id),
          rating: reviewRating,
          comment,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo guardar la reseña");
      }
      const saved = await res.json();
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setReviewComment("");
    } catch (e: any) {
      setReviewError(e?.message || "No se pudo guardar la reseña");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-4 md:py-8">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={pageImage} />
      </Head>
      {productJsonLd && (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}

      {!product ? (
        <div className="w-full flex flex-col gap-4 items-center justify-center py-20">
          <p className="text-lg font-medium">Producto no encontrado.</p>
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <>
          <div className="md:hidden mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex gap-3">
                <div className="relative h-40 w-40 shrink-0 rounded-lg overflow-hidden bg-white">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${mainImage})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "contain",
                      backgroundPosition: "50% 50%",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Patrocinado</p>
                  <h1 className="mt-1 text-xl font-semibold leading-6 line-clamp-3">{product.title || product.code || "Producto"}</h1>
                  <div className="mt-2 flex items-center gap-1 text-amber-500">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <FaStar key={i} className={`h-4 w-4 ${i < Math.round(reviewAverage) ? "text-amber-500" : "text-gray-300"}`} />
                    ))}
                    <span className="ml-1 text-sm text-gray-700">{reviewAverage.toFixed(1)} ({reviewCount})</span>
                  </div>
                  <div className="mt-2 text-3xl leading-none font-semibold text-gray-900">
                    <FormattedPrice amount={Number(product.price) || 0} />
                  </div>
                  <p className="mt-2 text-sm text-gray-700">Entrega entre 2 a 3 dias aproximadamente</p>
                  <p className="text-sm text-gray-500">Se envia a Peru</p>
                  <button
                    onClick={() => addProductToCart(qty)}
                    className="mt-3 h-11 w-full rounded-full bg-orange-500 text-white text-base font-semibold hover:brightness-95"
                  >
                    Agregar al carrito
                  </button>
                  <a
                    href={waBuyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 h-11 w-full rounded-full border border-brand_green text-brand_green text-base font-semibold flex items-center justify-center hover:bg-brand_green hover:text-white"
                  >
                    Comprar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-1 lg:grid-cols-[72px_minmax(0,720px)_minmax(0,1fr)] gap-4 items-start">
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-[72px_minmax(0,1fr)] gap-4 items-start">
              <div className="hidden lg:flex flex-col gap-3 pt-6">
                {productImages.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-14 w-14 rounded ${mainImage === img ? "ring-2 ring-amazon_blue" : "ring-1 ring-gray-200"} bg-white overflow-hidden`}
                  >
                    <Image src={img} alt="Miniatura" width={80} height={80} className="object-cover" />
                  </button>
                ))}
              </div>

              <div className="bg-transparent rounded-xl p-0 w-full">
                <div className="relative w-full h-[360px] md:h-[520px] bg-white rounded-xl overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${mainImage})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "contain",
                      backgroundPosition: "50% 50%",
                      backgroundColor: "transparent",
                      transition: "none",
                    }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1 lg:hidden">
                  {productImages.map((img) => (
                    <button
                      key={img}
                      onClick={() => setActiveImage(img)}
                      className={`h-12 w-12 rounded ${mainImage === img ? "ring-2 ring-amazon_blue" : "ring-1 ring-gray-200"} bg-white`}
                      aria-label="Cambiar imagen"
                    >
                      <Image src={img} alt="Miniatura" width={64} height={64} className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-lg font-semibold">Resenas</h2>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <FaStar key={i} className={`h-4 w-4 ${i < Math.round(reviewAverage) ? "text-amber-500" : "text-gray-300"}`} />
                    ))}
                    <span className="text-gray-700 text-sm ml-2">{reviewAverage.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">{reviewCount} resenas</span>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Tu reseña</p>
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={`rate-${n}`}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            className="p-0.5"
                            aria-label={`Calificar ${n} estrellas`}
                          >
                            <FaStar className={`h-5 w-5 ${n <= reviewRating ? "text-amber-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full min-h-[92px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amazon_blue"
                        placeholder="Escribe tu comentario sobre este producto"
                        maxLength={500}
                      />
                      {reviewError && <p className="mt-2 text-xs text-red-600">{reviewError}</p>}
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={submitReview}
                          disabled={submittingReview}
                          className="px-4 py-2 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60"
                        >
                          {submittingReview ? "Guardando..." : "Publicar reseña"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Inicia sesion para comentar y calificar este producto.
                      <button
                        type="button"
                        onClick={() => signIn(undefined, { callbackUrl: router.asPath })}
                        className="ml-2 text-amazon_blue font-semibold hover:underline"
                      >
                        Iniciar sesion
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid gap-4">
                  {loadingReviews && (
                    <div className="text-sm text-gray-600">Cargando resenas...</div>
                  )}
                  {!loadingReviews && reviews.length === 0 && (
                    <div className="text-sm text-gray-600">Aun no hay resenas para este producto.</div>
                  )}
                  {!loadingReviews && reviews.map((r) => (
                    <div key={r.id} className="rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                          {String(r.userName || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.userName || "Usuario"}</p>
                          <p className="text-xs text-gray-500">{fmtReviewDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 mt-2">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <FaStar key={i} className={`h-4 w-4 ${i < Number(r.rating || 0) ? "text-amber-500" : "text-gray-300"}`} />
                        ))}
                        <span className="text-sm text-orange-600 ml-1">
                          {Number(r.rating || 0) >= 4 ? "Excelente" : Number(r.rating || 0) >= 3 ? "Bueno" : "Regular"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full pt-6">
              <div className="rounded-xl p-5">
                <p className="text-xs text-gray-500">Inicio / {product.category || "Categoria"}</p>
                <h1 className="text-xl md:text-2xl font-semibold mt-2">{product.title || product.code || "Producto"}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <span>{salesCount} ventas</span>
                  <span className="text-gray-300">|</span>
                  <span>Distribuidor Rossy Resina</span>
                  <div className="flex items-center gap-1 text-yellow-500 ml-auto">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <FaStar key={i} className={`h-4 w-4 ${i < Math.round(reviewAverage) ? "text-amber-500" : "text-gray-300"}`} />
                    ))}
                    <span className="text-gray-700 text-sm ml-1">{reviewAverage.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-2xl font-semibold text-gray-900">
                    <FormattedPrice amount={Number(product.price) || 0} />
                  </span>
                  {typeof product.oldPrice === "number" && product.oldPrice > product.price && (
                    <span className="text-sm line-through text-gray-400">
                      <FormattedPrice amount={Number(product.oldPrice) || 0} />
                    </span>
                  )}
                  {typeof product.oldPrice === "number" && product.oldPrice > product.price && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                      Descuento
                    </span>
                  )}
                </div>
                <div className="mt-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-md px-3 py-2">
                  {shippingText} · S/ 4.00 de credito por retraso
                </div>
                <div className="mt-3 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                  Ideal para emprender: crea piezas para vender y recuperar tu inversion rapido.
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">Cantidad:</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center justify-between border border-gray-300 px-3 py-1 rounded-md w-28">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-lg">-</button>
                      <span className="font-semibold">{qty}</span>
                      <button onClick={() => setQty((q) => q + 1)} className="text-lg">+</button>
                    </div>
                    <a href={waHref} target="_blank" rel="noreferrer" className="text-sm px-3 py-2 rounded border border-brand_green text-brand_green hover:bg-brand_green hover:text-white">
                      Compartir por WhatsApp
                    </a>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <button
                    onClick={() => addProductToCart(qty)}
                    className="w-full h-12 rounded-full text-base font-semibold bg-orange-500 text-white hover:brightness-95"
                  >
                    ¡Agregar al carrito!
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full h-12 rounded-full text-base font-semibold border border-brand_purple text-brand_purple hover:bg-pink-50"
                  >
                    Comprar ahora
                  </button>
                  <a
                    href={waBuyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-12 rounded-full text-base font-semibold border border-brand_green text-brand_green hover:bg-brand_green hover:text-white flex items-center justify-center"
                  >
                    Comprar por WhatsApp
                  </a>
                </div>

                <div className="mt-4 text-sm text-gray-600 grid gap-1">
                  <p>Entrega: entre 2 a 3 dias aproximadamente</p>
                  <p>Transportistas: Shalom, Olva Courier</p>
                </div>
              </div>

              <div className="rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">¿Por que elegir Rossy Resina?</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-gray-800">Seguridad y privacidad</p>
                    <ul className="mt-2 list-disc list-inside">
                      <li>Pagos seguros</li>
                      <li>Privacidad segura</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-gray-800">Entrega garantizada</p>
                    <ul className="mt-2 list-disc list-inside">
                      <li>Reembolso por 30 dias</li>
                      <li>Credito por retraso</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 text-sm text-emerald-700">
                  Devoluciones gratis · Ajuste de precios
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-3">Explora tus intereses</h2>
            {recs.length > 0 ? (
              <Products
                productData={recs}
                gridClass="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5"
              />
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
  const all: ProductProps[] = readCatalog() as ProductProps[];
  const product =
    all.find((p) => String(p._id) === id) ||
    all.find((p) => String(p.code || "").toLowerCase() === id.toLowerCase()) ||
    null;
  const recs = product
    ? (() => {
        const withoutCurrent = all.filter((p) => String(p._id) !== String(product._id));
        const sameCategory = withoutCurrent.filter(
          (p) => String(p.category) === String(product.category)
        );
        const fallback = withoutCurrent.filter(
          (p) => String(p.category) !== String(product.category)
        );
        return [...sameCategory, ...fallback].slice(0, 25);
      })()
    : [];
  return { props: { product, recs } };
};
