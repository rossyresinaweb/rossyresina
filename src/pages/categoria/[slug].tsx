import Head from "next/head";
import Link from "next/link";
import fs from "fs";
import path from "path";
import Products from "@/components/Products";
import type { ProductProps } from "../../../type";
import { useMemo, useState } from "react";

const slugToCategory: Record<string, string> = {
  resina: "Resinas",
  "moldes-de-silicona": "Moldes de silicona",
  pigmentos: "Pigmentos",
  accesorios: "Accesorios",
  creaciones: "Creaciones",
  talleres: "Talleres",
};

interface Props {
  slug: string;
  label: string | null;
  items: ProductProps[];
}

export default function CategoryPage({ slug, label, items }: Props) {
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const filtered = useMemo(() => {
    let list = [...items];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.brand, p.category, p.code].join(" ").toLowerCase().includes(q)
      );
    }
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null && !Number.isNaN(min)) {
      list = list.filter((p) => Number(p.price) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      list = list.filter((p) => Number(p.price) <= max);
    }
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name-asc":
        list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
        break;
      case "newest":
        list.sort((a, b) => Number(b._id) - Number(a._id));
        break;
      default:
        break;
    }
    return list;
  }, [items, query, minPrice, maxPrice, sortBy]);
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Rossy Resina — {label || "Categoría"}</title>
        <meta
          name="description"
          content={label ? `Compra ${label} en Rossy Resina. Resina, moldes, pigmentos y más.` : "Explora nuestras categorías de productos."}
        />
        <meta property="og:title" content={`Rossy Resina — ${label || "Categoría"}`} />
        <meta
          property="og:description"
          content={label ? `Compra ${label} en Rossy Resina.` : "Explora nuestras categorías de productos."}
        />
        <meta property="og:type" content="website" />
      </Head>
{label ? (
        <>
          <h1 className="text-2xl font-semibold mb-4">{label}</h1>
          {items.length > 0 ? (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar en la categoría..."
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Precio mínimo"
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Precio máximo"
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  >
                    <option value="featured">Destacados</option>
                    <option value="newest">Más nuevos</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                    <option value="name-asc">Nombre A-Z</option>
                  </select>
                </div>
              </div>
              <Products productData={filtered} />
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700">No hay productos en esta categoría por ahora.</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700">Categoría no válida.</p>
          <div className="mt-4">
            <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Ir al inicio</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const slug: string = String(ctx.params.slug || "");
  const label = slugToCategory[slug] || null;
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "products.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const all: ProductProps[] = JSON.parse(raw);
    const items = label ? all.filter((p) => String(p.category).toLowerCase() === String(label).toLowerCase()) : [];
    items.sort((a, b) => {
      const ac = (a.code || "").toString();
      const bc = (b.code || "").toString();
      if (ac && bc) return ac.localeCompare(bc, undefined, { numeric: true, sensitivity: "base" });
      if (ac) return -1;
      if (bc) return 1;
      return (a._id || 0) - (b._id || 0);
    });
    return { props: { slug, label, items } };
  } catch (e) {
    return { props: { slug, label, items: [] } };
  }
};
