import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ProductProps } from "../../type";
import { CheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/nextSlice";
import Link from "next/link";
import FormattedPrice from "./FormattedPrice";
import { formatProductTitle } from "@/lib/textFormat";

interface ProductsProps {
  productData: ProductProps[];
  gridClass?: string;
}

const Products = ({
  productData,
  gridClass = "grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5",
}: ProductsProps) => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState<
    Record<string, { salesCount: number; avgRating: number; reviewCount: number }>
  >({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const normImg = (s?: string) => {
    const t = String(s || "");
    if (!t) return "/favicon-96x96.png";
    let u = t.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    if (!u.startsWith("/")) u = "/" + u;
    return u;
  };

  const isProcessImage = (src?: string) => {
    const imgSrc = normImg(src).toLowerCase();
    return (
      !src ||
      String(src).trim() === "" ||
      imgSrc.includes("sliderimg_") ||
      imgSrc.includes("favicon-96x96.png") ||
      imgSrc.includes("favicon") ||
      imgSrc.includes("/logo.png") ||
      imgSrc.includes("/logo.jpg") ||
      imgSrc.endsWith("/logo")
    );
  };

  const pickDisplayImage = (image?: string, images?: any): string => {
    const gallery = Array.isArray(images)
      ? images.map((x) => String(x || "").trim()).filter(Boolean)
      : [];
    const preferred = [String(image || "").trim(), ...gallery].find((img) => !isProcessImage(img));
    return preferred || String(image || "").trim() || gallery[0] || "/favicon-96x96.png";
  };

  const productSlug = (code?: string, id?: number) => {
    return code ? `/${code}` : `/${id}`;
  };

  const idsParam = useMemo(() => {
    const ids = (Array.isArray(productData) ? productData : [])
      .map((p: ProductProps) => String(p?._id ?? "").trim())
      .filter(Boolean);
    return Array.from(new Set(ids)).join(",");
  }, [productData]);

  useEffect(() => {
    if (!idsParam) {
      setStats({});
      return;
    }
    let active = true;
    fetch(`/api/products/stats?ids=${encodeURIComponent(idsParam)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (!active) return;
        setStats(data && typeof data === "object" ? data : {});
      })
      .catch(() => {
        if (!active) return;
        setStats({});
      });
    return () => {
      active = false;
    };
  }, [idsParam]);

  const toProductHref = (
    code: string | undefined,
    _id: number,
    brand: string,
    category: string,
    description: string,
    image: string,
    isNew: boolean,
    oldPrice: number | undefined,
    price: number,
    title: string
  ) => ({
    pathname: productSlug(code, _id),
    query: {
      _id,
      brand,
      category,
      description,
      image,
      isNew,
      oldPrice,
      price,
      title,
    },
  });

  const showAddedFeedback = (id: number) => {
    const key = String(id);
    setAddedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedMap((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 1700);
  };

  return (
    <div className={`grid w-full items-stretch px-1 md:px-0 ${gridClass}`}>
      {(Array.isArray(productData) ? productData : []).map(
        ({ _id, code, title, brand, category, description, image, images, isNew, oldPrice, price }: ProductProps) => {
          const itemStats = stats[String(_id)] || { salesCount: 0, avgRating: 0, reviewCount: 0 };
          const wasAdded = Boolean(addedMap[String(_id)]);
          const hasDiscount = typeof oldPrice === "number" && oldPrice > price;
          const displayTitle = formatProductTitle(title || "Producto");
          const displayImage = pickDisplayImage(image, images);
          const href = toProductHref(
            code,
            _id,
            brand,
            category,
            description,
            displayImage,
            isNew,
            oldPrice,
            price,
            title
          );

          return (
            <div
              key={_id}
              className="snap-start flex h-full flex-col rounded-xl border border-gray-200 bg-white p-2.5 text-black transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 group"
            >
              <Link href={href} className="block">
                <div className="relative w-full overflow-hidden rounded-lg bg-white pb-[100%] group-hover:bg-gray-50 transition-colors duration-300">
                  {(() => {
                    const imgSrc = normImg(displayImage);
                    const isPlaceholder = isProcessImage(displayImage);
                    if (isPlaceholder) {
                      return (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 px-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                          Producto en Proceso
                        </div>
                      );
                    }
                    return (
                      <Image
                        src={imgSrc}
                        alt={displayTitle}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    );
                  })()}

                  <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1 z-10">
                    {isNew ? (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white shadow-md">
                        Nuevo
                      </span>
                    ) : null}
                    {hasDiscount ? (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white shadow-md">
                        Oferta
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>

              <div className="mt-2 flex flex-1 flex-col">
                <Link href={href} className="block group">
                  <p className="line-clamp-2 overflow-hidden text-sm font-medium leading-[1.15rem] text-gray-800 group-hover:text-amazon_blue transition-colors duration-200">
                    {displayTitle}
                  </p>
                </Link>

                <div className="mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900 md:text-xl">
                      <FormattedPrice amount={price} />
                    </span>
                    <span className="text-xs text-gray-500 md:text-sm">c/unidad</span>
                    {hasDiscount ? (
                      <span className="text-xs text-gray-400 line-through md:text-sm">
                        <FormattedPrice amount={oldPrice as number} />
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span>{itemStats.salesCount} ventas</span>
                    <span>
                      {itemStats.reviewCount > 0
                        ? `${itemStats.avgRating.toFixed(1)} (${itemStats.reviewCount})`
                        : "Sin reseñas"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-0.5 text-xs text-gray-900">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(itemStats.avgRating) ? "text-amber-500" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    dispatch(
                      addToCart({
                        _id,
                        brand,
                        category,
                        description,
                        image: displayImage,
                        isNew,
                        oldPrice,
                        price,
                        title,
                        quantity: 1,
                      })
                    );
                    showAddedFeedback(_id);
                  }}
                  className={
                    "mt-3 flex h-9 w-full items-center justify-center gap-1 rounded-full border text-xs font-semibold duration-300 transition-all " +
                    (wasAdded
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
                      : "border-gray-300 hover:border-amazon_blue hover:bg-amazon_blue hover:text-white hover:shadow-md")
                  }
                  aria-label="Agregar al carrito"
                >
                  {wasAdded ? <CheckIcon className="h-4 w-4" /> : <ShoppingCartIcon className="h-4 w-4" />}
                  {wasAdded ? "Producto añadido" : "Agregar"}
                </button>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

export default Products;
