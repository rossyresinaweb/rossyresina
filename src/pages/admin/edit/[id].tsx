import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import ProductVariants, { type Variant } from "@/components/admin/ProductVariants";

const normalizeUrls = (value: any): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x || "").trim()).filter(Boolean);
};

const isPlaceholderImage = (value: any): boolean => {
  const src = String(value || "").trim().toLowerCase();
  if (!src) return true;
  return (
    src.includes("favicon") ||
    src.includes("sliderimg_") ||
    src.endsWith("/logo") ||
    src.includes("/logo.png") ||
    src.includes("/logo.jpg")
  );
};

const pickMainFromGallery = (currentImage: any, nextImages: string[]): string => {
  const current = String(currentImage || "").trim();
  const firstCloudinary = nextImages.find((img) => /cloudinary\.com/i.test(String(img)));
  if (firstCloudinary && !/cloudinary\.com/i.test(current)) return firstCloudinary;
  if (current && nextImages.includes(current) && !isPlaceholderImage(current)) return current;

  const firstReal = nextImages.find((img) => !isPlaceholderImage(img));
  if (firstReal) return firstReal;

  return "";
};

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState("");
  const [categories, setCategories] = useState<Array<{ _id: number; name: string; slug: string }>>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [productDbId, setProductDbId] = useState<string | undefined>(undefined);

  const galleryImages = useMemo(() => normalizeUrls(form?.images), [form?.images]);
const mainImagePreview = useMemo(() => {
  const current = String(form?.image || "").trim();
  if (current && !isPlaceholderImage(current)) return current;
  const goodFromGallery = galleryImages.find((img) => !isPlaceholderImage(img));
  return String(goodFromGallery || "").trim();
}, [form?.image, galleryImages]);
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await fetch("/api/products");
        const items = await res.json();
        const needle = String(id || "").trim().toLowerCase();
        const found = items.find((p: any) => {
          const pCode = String(p?.code || "").trim().toLowerCase();
          const pId = String(p?._id || "").trim().toLowerCase();
          return (needle && pCode === needle) || (needle && pId === needle);
        });
        if (found) {
          const images = normalizeUrls(found.images);
          const normalizedImages = images.length > 0 ? images : found.image ? [String(found.image)] : [];
          setForm({ ...found, images: normalizedImages, image: String(found.image || normalizedImages[0] || "") });
          // Cargar variantes del producto
          const dbId = found.id || found._id;
          setProductDbId(String(dbId));
          const vRes = await fetch(`/api/products/variants?productId=${dbId}`);
          if (vRes.ok) setVariants(await vRes.json());
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando categorías", err);
      }
    };
    loadCategories();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaveError("");
    setSaveOk("");

    const images = normalizeUrls(form.images);
    if (images.length === 0) {
      setSaveError("Debes subir al menos una imagen del producto en Cloudinary.");
      return;
    }

    // Siempre enviar TODAS las imágenes y SIEMPRE preservar existentes
    const payload = {
      _id: form._id || form.id,
      code: form.code,
      legacyId: form.legacyId,
      title: form.title,
      description: form.description,
      brand: form.brand,
      category: form.category,
      price: form.price,
      oldPrice: form.oldPrice,
      stock: form.stock,
      barcode: form.barcode,
      sku: form.sku,
      isNew: form.isNew,
      images: images,
      image: String(form.image || images[0] || "").trim(),
      preserveExistingImages: true,
    };

    try {
      setSaving(true);
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(String(json?.error || "No se pudo actualizar el producto."));
      }
      const updated = await res.json();
      // Recargar el producto desde el servidor para sincronizar correctamente
      const res2 = await fetch("/api/products");
      const allItems = await res2.json();
      const needle = String(form._id || form.id || "").trim().toLowerCase();
      const reloaded = allItems.find((p: any) => {
        const pCode = String(p?.code || "").trim().toLowerCase();
        const pId = String(p?._id || "").trim().toLowerCase();
        return (needle && pCode === needle) || (needle && pId === needle);
      });
      if (reloaded) {
        const reloadedImages = normalizeUrls(reloaded.images);
        const normalizedReloadedImages = reloadedImages.length > 0 ? reloadedImages : reloaded.image ? [String(reloaded.image)] : [];
        setForm({ ...reloaded, images: normalizedReloadedImages, image: String(reloaded.image || normalizedReloadedImages[0] || "") });
      }
      setSaveOk("Producto actualizado correctamente.");
    } catch (err: any) {
      setSaveError(err?.message || "Error al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const addImage = async () => {
    if (!form || files.length === 0) return;
    setUploadError("");
    setUploading(true);

    const toDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(f);
      });

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const dataUrl = await toDataUrl(file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, data: dataUrl }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(String(json?.error || "No se pudo subir la imagen"));
        const url = String(json.url || "").trim();
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        const nextImages = Array.from(new Set([...galleryImages, ...uploadedUrls]));
        setForm({
          ...form,
          images: nextImages,
          image: pickMainFromGallery(form.image, nextImages),
        });
      }
      setFiles([]);
    } catch (err: any) {
      setUploadError(err?.message || "Error al subir imágenes");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    if (!form) return;
    const nextImages = galleryImages.filter((img) => img !== url);
    const nextMain = form.image === url ? nextImages[0] || "" : form.image;
    setForm({ ...form, images: nextImages, image: nextMain });
  };

  const setAsMain = (url: string) => {
    if (!form) return;
    setForm({ ...form, image: url });
  };

  if (loading || !form) return <div className="mx-auto max-w-4xl p-6">Cargando...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-5 text-2xl font-semibold">Editar producto</h1>

      <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-12">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 lg:col-span-7">
          <h2 className="text-sm font-semibold text-gray-700">Datos del producto</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-gray-700">Título</span>
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-700">Marca</span>
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.brand || ""}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-700">Categoría</span>
              <select
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-gray-700">Descripción</span>
              <textarea
                rows={5}
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-700">Precio anterior</span>
              <input
                type="number"
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.oldPrice || 0}
                onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-700">Precio</span>
              <input
                type="number"
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.price || 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-700">Inventario (stock)</span>
              <input
                type="number"
                min={0}
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.stock ?? 0}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-700">Codigo de barras</span>
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.barcode || ""}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="Opcional. Si lo dejas vacio, se genera automatico"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-700">SKU (Código de inventario)</span>
              <input
                className="rounded-md border border-gray-300 px-3 py-2"
                value={form.sku || ""}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Ej: ACC-2026-0001"
              />
            </label>

            <label className="inline-flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={!!form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
              />
              <span>Nuevo</span>
            </label>
          </div>

          {form?.category === "Resinas" && (
            <ProductVariants productId={productDbId} variants={variants} onChange={setVariants} />
          )}

          <div className="space-y-3 border-t border-gray-100 pt-4">
            {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
            {saveOk ? <p className="text-sm text-emerald-700">{saveOk}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-amazon_blue px-4 py-2 text-white hover:bg-amazon_yellow hover:text-black disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Volver al listado
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 lg:col-span-5">
          <h2 className="text-sm font-semibold text-gray-700">Imágenes (Cloudinary)</h2>

          <div className="grid gap-2">
            <span className="text-sm text-gray-700">Subir imágenes</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              <button
                type="button"
                onClick={addImage}
                disabled={uploading || files.length === 0}
                className="rounded-md bg-brand_teal px-3 py-2 text-white disabled:opacity-50"
              >
                {uploading ? "Subiendo..." : "Agregar"}
              </button>
            </div>
            <p className="text-xs text-gray-500">La primera imagen queda como principal. Puedes cambiarla con Usar principal.</p>
            {files.length > 0 ? <p className="text-xs text-gray-500">{files.length} archivo(s) seleccionado(s)</p> : null}
            {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-700">Vista previa imagen principal</p>
            {mainImagePreview ? (
              <div className="mt-2">
                <div className="relative h-44 w-full overflow-hidden rounded-md border border-gray-200 bg-white">
                  <Image src={mainImagePreview} alt="Vista previa principal" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
                </div>
                <p className="mt-2 break-all text-xs text-gray-500">{mainImagePreview}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">Sube imágenes para establecer la principal.</p>
            )}
          </div>

          <div className="grid gap-2">
            <span className="text-sm text-gray-700">Galería del producto</span>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {galleryImages.map((img) => (
                  <div key={img} className="rounded-md border border-gray-200 bg-white p-2">
                    <div className="relative h-28 w-full overflow-hidden rounded border border-gray-100 bg-gray-50">
                      <Image src={img} alt="Imagen del producto" fill sizes="220px" className="object-cover" />
                    </div>
                    <p className="mt-2 break-all text-[11px] text-gray-500">{img}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAsMain(img)}
                        className="rounded bg-amazon_blue px-2 py-1 text-xs text-white"
                      >
                        Usar principal
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No hay imágenes. Sube al menos una.</p>
            )}
          </div>
        </section>

      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) {
    return { redirect: { destination: `/admin/sign-in?callbackUrl=/admin/edit/${ctx.params?.id ?? ""}`, permanent: false } };
  }
  return { props: {} };
};

