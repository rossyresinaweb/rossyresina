import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart, addToFavorite } from "@/store/nextSlice";
import FormattedPrice from "@/components/FormattedPrice";

export default function ComparePage() {
  const dispatch = useDispatch();
  const [all, setAll] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((data) => setAll(Array.isArray(data) ? data : [])).catch(() => setAll([]));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all.slice(0, 12);
    return all.filter((p) => String(p.title).toLowerCase().includes(s) || String(p.category).toLowerCase().includes(s)).slice(0, 20);
  }, [q, all]);

  const addSel = (p: any) => {
    if (selected.find((x) => x._id === p._id)) return;
    if (selected.length >= 3) return;
    setSelected([...selected, p]);
  };
  const removeSel = (_id: any) => setSelected(selected.filter((x) => x._id !== _id));

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
<div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex-1">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por nombre o categoría" className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded" />
          </div>
          <div className="text-sm text-gray-700">Seleccionados: {selected.length} / 3</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {filtered.map((p) => (
            <div key={p._id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <Image src={((): string => { const s = String(p.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()} alt={p.title} width={300} height={200} className="w-full h-32 object-cover" />
              <div className="p-2">
                <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                <p className="text-xs text-gray-600 line-clamp-1">{p.category}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => addSel(p)} className="text-xs px-3 py-1 rounded bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Añadir</button>
                  <Link href={{ pathname: `/${p._id}`, query: { ...p } }} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">Ver</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Comparación</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `200px repeat(${selected.length}, minmax(220px,1fr))` }}>
              <div className="bg-gray-50 border p-3 font-semibold">Campo</div>
              {selected.map((p) => (
                <div key={`h-${p._id}`} className="bg-gray-50 border p-3 flex items-center justify-between">
                  <span className="font-semibold line-clamp-1">{p.title}</span>
                  <button onClick={() => removeSel(p._id)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100">Quitar</button>
                </div>
              ))}

              <div className="border p-3">Imagen</div>
              {selected.map((p) => (
                <div key={`img-${p._id}`} className="border p-3">
                  <Image src={((): string => { const s = String(p.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()} alt={p.title} width={160} height={120} className="rounded object-cover" />
                </div>
              ))}

              <div className="border p-3">Precio</div>
              {selected.map((p) => (
                <div key={`price-${p._id}`} className="border p-3">
                  <span className="text-amazon_blue font-semibold"><FormattedPrice amount={p.price} /></span>
                  {p.oldPrice ? (
                    <span className="ml-2 text-sm line-through"><FormattedPrice amount={p.oldPrice} /></span>
                  ) : null}
                </div>
              ))}

              <div className="border p-3">Ahorro</div>
              {selected.map((p) => (
                <div key={`save-${p._id}`} className="border p-3">
                  {p.oldPrice ? (
                    <FormattedPrice amount={p.oldPrice - p.price} />
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </div>
              ))}

              <div className="border p-3">Categoría</div>
              {selected.map((p) => (
                <div key={`cat-${p._id}`} className="border p-3">{p.category}</div>
              ))}

              <div className="border p-3">Marca</div>
              {selected.map((p) => (
                <div key={`brand-${p._id}`} className="border p-3">{p.brand || "—"}</div>
              ))}

              <div className="border p-3">Nuevo</div>
              {selected.map((p) => (
                <div key={`new-${p._id}`} className="border p-3">{p.isNew ? "Sí" : "No"}</div>
              ))}

              <div className="border p-3">Descripción</div>
              {selected.map((p) => (
                <div key={`desc-${p._id}`} className="border p-3 text-sm text-gray-700 line-clamp-3">{p.description}</div>
              ))}

              <div className="border p-3">Acciones</div>
              {selected.map((p) => (
                <div key={`act-${p._id}`} className="border p-3 flex items-center gap-2">
                  <button onClick={() => dispatch(addToCart({ _id: p._id, brand: p.brand, category: p.category, description: p.description, image: p.image, isNew: p.isNew, oldPrice: p.oldPrice, price: p.price, title: p.title, quantity: 1 }))} className="text-xs px-3 py-1 rounded bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Agregar al carrito</button>
                  <button onClick={() => dispatch(addToFavorite({ _id: p._id, brand: p.brand, category: p.category, description: p.description, image: p.image, isNew: p.isNew, oldPrice: p.oldPrice, price: p.price, title: p.title, quantity: 1 }))} className="text-xs px-3 py-1 rounded border border-brand_teal text-brand_teal hover:bg-brand_teal hover:text-white">Favorito</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
