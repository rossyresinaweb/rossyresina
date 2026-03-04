import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const res = await fetch("/api/products");
      const items = await res.json();
      const found = items.find((p: any) => String(p._id) === String(id));
      setForm(found);
      setLoading(false);
    };
    load();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin");
  };

  const addImage = async () => {
    if (!file) return;
    setUploading(true);
    const toDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(f);
      });
    const dataUrl = await toDataUrl(file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, data: dataUrl }),
    });
    const json = await res.json();
    setForm({ ...form, image: json.url });
    setUploading(false);
  };

  if (loading || !form) return <div className="max-w-2xl mx-auto p-6">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Editar producto</h1>
      <form onSubmit={submit} className="grid gap-4">
        {[
          ["title","Título"],
          ["brand","Marca"],
          ["category","Categoría"],
          ["description","Descripción"],
          ["image","URL de imagen"],
        ].map(([key,label]) => (
          <label key={key as string} className="grid gap-1">
            <span className="text-sm text-gray-700">{label}</span>
            <input
              className="rounded-md px-3 py-2"
              value={(form as any)[key as string]}
              onChange={(e) => setForm({ ...form, [key as string]: e.target.value })}
            />
          </label>
        ))}
        <div className="grid gap-2">
          <span className="text-sm text-gray-700">Añadir imagen</span>
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="button" onClick={addImage} disabled={uploading || !file} className="px-3 py-2 rounded-md bg-brand_teal text-white disabled:opacity-50">
              {uploading ? "Subiendo..." : "Añadir"}
            </button>
          </div>
          {form.image && <span className="text-xs text-gray-600">Imagen: {form.image}</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Precio anterior</span>
            <input type="number" className="rounded-md px-3 py-2" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Precio</span>
            <input type="number" className="rounded-md px-3 py-2" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </label>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
          <span>Nuevo</span>
        </label>
        <button type="submit" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Guardar cambios</button>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) {
    return { redirect: { destination: `/sign-in?callbackUrl=/admin/edit/${ctx.params?.id ?? ""}`, permanent: false } };
  }
  return { props: {} };
};
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";
