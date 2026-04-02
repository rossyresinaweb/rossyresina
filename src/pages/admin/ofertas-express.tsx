import { useEffect, useState } from "react";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";
import { PlusIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

interface OfertaExpress {
  id: string;
  nombre: string;
  imagen: string;
  activo: boolean;
  orden: number;
}

const emptyForm = { nombre: "", imagen: "", activo: true, orden: 0 };

export default function AdminOfertasExpress() {
  const [items, setItems] = useState<OfertaExpress[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/ofertas-express?all=1");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const uploadImage = async (f: File): Promise<string> => {
    const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    const dataUrl = await toDataUrl(f);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: f.name, data: dataUrl }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Error al subir imagen");
    return json.url;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imagen = form.imagen;
      if (file) {
        setUploading(true);
        imagen = await uploadImage(file);
        setUploading(false);
        setFile(null);
      }
      if (!imagen) { setNotice("Debes subir una imagen"); setSaving(false); return; }
      if (!form.nombre) { setNotice("El nombre es requerido"); setSaving(false); return; }

      const payload = { ...form, imagen };
      if (editId) payload.id = editId;

      const res = await fetch("/api/ofertas-express", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setForm(emptyForm);
      setEditId(null);
      setNotice(editId ? "Actualizado correctamente" : "Creado correctamente");
      await load();
    } catch (err: any) {
      setNotice(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: OfertaExpress) => {
    setEditId(item.id);
    setForm({ nombre: item.nombre, imagen: item.imagen, activo: item.activo, orden: item.orden });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta oferta express?")) return;
    await fetch(`/api/ofertas-express?id=${id}`, { method: "DELETE" });
    await load();
  };

  const toggleActivo = async (item: OfertaExpress) => {
    await fetch("/api/ofertas-express", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, activo: !item.activo }),
    });
    await load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Ofertas Express</h1>

      {/* Formulario */}
      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">{editId ? "Editar oferta" : "Nueva oferta express"}</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm text-gray-700">Nombre del producto</span>
            <input
              className="rounded-md border border-gray-300 px-3 py-2"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Molde Corazón Premium"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Imagen</span>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {form.imagen && (
              <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 mt-1">
                <Image src={form.imagen} alt="preview" fill className="object-cover" />
              </div>
            )}
          </label>

          <div className="grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-gray-700">Orden (menor = primero)</span>
              <input
                type="number"
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.orden}
                onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
              />
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
              <span className="text-sm">Activo (visible en tienda)</span>
            </label>
          </div>
        </div>

        {notice && <p className="text-sm text-emerald-700">{notice}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-4 py-2 rounded-lg bg-amazon_blue text-white text-sm font-semibold disabled:opacity-60"
          >
            {uploading ? "Subiendo imagen..." : saving ? "Guardando..." : editId ? "Guardar cambios" : "Crear oferta"}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">{items.length} ofertas express</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="h-6 w-6 rounded-full border-4 border-amazon_blue border-t-transparent animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">No hay ofertas express. Crea la primera.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                  <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-400">Orden: {item.orden}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActivo(item)}
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${item.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {item.activo ? "Activo" : "Inactivo"}
                  </button>
                  <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200">
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/admin/sign-in", permanent: false } };
  return { props: {} };
};
