import { useState } from "react";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

export type Variant = {
  id?: string;
  label: string;
  price: number;
  oldPrice: number | null;
  stock: number;
};

type Props = {
  productId?: string; // si existe = modo edición (guarda en BD directo)
  variants: Variant[];
  onChange: (variants: Variant[]) => void; // para modo nuevo (sin productId)
};

const emptyVariant = (): Variant => ({ label: "", price: 0, oldPrice: null, stock: 0 });

export default function ProductVariants({ productId, variants, onChange }: Props) {
  const [form, setForm] = useState<Variant>(emptyVariant());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    try {
      if (productId) {
        // Modo edición — guarda directo en BD
        if (editingId) {
          const res = await fetch("/api/products/variants", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingId, ...form }),
          });
          if (res.ok) {
            const updated = await res.json();
            onChange(variants.map((v) => v.id === editingId ? updated : v));
          }
        } else {
          const res = await fetch("/api/products/variants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, ...form }),
          });
          if (res.ok) {
            const created = await res.json();
            onChange([...variants, created]);
          }
        }
      } else {
        // Modo nuevo — solo actualiza estado local
        if (editingId !== null) {
          onChange(variants.map((v, i) => String(i) === editingId ? { ...form } : v));
        } else {
          onChange([...variants, { ...form }]);
        }
      }
      setForm(emptyVariant());
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v: Variant, idx: number) => {
    setForm({ label: v.label, price: v.price, oldPrice: v.oldPrice, stock: v.stock });
    setEditingId(v.id ?? String(idx));
  };

  const handleDelete = async (v: Variant, idx: number) => {
    if (!confirm(`¿Eliminar variante "${v.label}"?`)) return;
    if (productId && v.id) {
      await fetch(`/api/products/variants?id=${v.id}`, { method: "DELETE" });
    }
    onChange(variants.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <h3 className="text-sm font-semibold text-gray-700">Variantes (presentaciones)</h3>
      <p className="text-xs text-gray-500">Ej: 1kg, 2kg, Galón (4kg). Cada una con su precio y stock.</p>

      {variants.length > 0 && (
        <div className="grid gap-2">
          {variants.map((v, idx) => (
            <div key={v.id ?? idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-900">{v.label}</span>
                <span className="ml-2 text-gray-600">S/ {Number(v.price).toFixed(2)}</span>
                {v.oldPrice ? <span className="ml-2 text-xs line-through text-gray-400">S/ {Number(v.oldPrice).toFixed(2)}</span> : null}
                <span className="ml-2 text-xs text-gray-500">Stock: {v.stock}</span>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => handleEdit(v, idx)} className="p-1.5 rounded border border-gray-200 hover:bg-white">
                  <PencilIcon className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button type="button" onClick={() => handleDelete(v, idx)} className="p-1.5 rounded border border-red-200 hover:bg-red-50">
                  <TrashIcon className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-3 grid gap-2">
        <p className="text-xs font-semibold text-gray-600">{editingId !== null ? "Editar variante" : "Nueva variante"}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs text-gray-500">Presentación *</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
              placeholder="Ej: 1kg, Galón (4kg)"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Precio (S/) *</label>
            <input
              type="number" min={0} value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Precio anterior</label>
            <input
              type="number" min={0} value={form.oldPrice ?? ""}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value ? Number(e.target.value) : null })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Stock</label>
            <input
              type="number" min={0} value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button" onClick={handleSave} disabled={saving || !form.label.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold disabled:opacity-50"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            {saving ? "Guardando..." : editingId !== null ? "Actualizar" : "Agregar"}
          </button>
          {editingId !== null && (
            <button type="button" onClick={() => { setForm(emptyVariant()); setEditingId(null); }}
              className="px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
