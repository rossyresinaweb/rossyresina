import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

type Inscripcion = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  curso: string;
  nivel: string;
  mensaje: string;
  estado: string;
  fechaProgramada: string | null;
  notaAdmin: string;
  createdAt: string;
};

const ESTADOS = ["PENDIENTE", "CONTACTADO", "PROGRAMADO", "COMPLETADO", "CANCELADO"];

const estadoBadge: Record<string, string> = {
  PENDIENTE:   "bg-amber-50 text-amber-700 border-amber-200",
  CONTACTADO:  "bg-blue-50 text-blue-700 border-blue-200",
  PROGRAMADO:  "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETADO:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELADO:   "bg-red-50 text-red-700 border-red-200",
};

const estadoIcon: Record<string, React.ReactNode> = {
  PENDIENTE:   <ClockIcon className="w-3.5 h-3.5" />,
  CONTACTADO:  <EnvelopeIcon className="w-3.5 h-3.5" />,
  PROGRAMADO:  <CalendarDaysIcon className="w-3.5 h-3.5" />,
  COMPLETADO:  <CheckCircleIcon className="w-3.5 h-3.5" />,
  CANCELADO:   <XCircleIcon className="w-3.5 h-3.5" />,
};

export default function AdminInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ estado: "", fechaProgramada: "", notaAdmin: "" });
  const [saving, setSaving] = useState(false);
  const [filterEstado, setFilterEstado] = useState("TODOS");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/capacitaciones/inscripciones");
      const data = await res.json();
      setInscripciones(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (i: Inscripcion) => {
    setEditingId(i.id);
    setEditForm({
      estado: i.estado,
      fechaProgramada: i.fechaProgramada ? i.fechaProgramada.slice(0, 16) : "",
      notaAdmin: i.notaAdmin || "",
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await fetch("/api/capacitaciones/inscripciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      await load();
      setEditingId(null);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta inscripción?")) return;
    await fetch(`/api/capacitaciones/inscripciones?id=${id}`, { method: "DELETE" });
    await load();
  };

  const filtered = filterEstado === "TODOS"
    ? inscripciones
    : inscripciones.filter((i) => i.estado === filterEstado);

  const counts = ESTADOS.reduce((acc, e) => {
    acc[e] = inscripciones.filter((i) => i.estado === e).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-screen-xl mx-auto">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {ESTADOS.map((e) => (
          <div key={e} className={`rounded-xl border p-3 cursor-pointer transition ${filterEstado === e ? "ring-2 ring-amazon_blue" : ""} ${estadoBadge[e]}`}
            onClick={() => setFilterEstado(filterEstado === e ? "TODOS" : e)}>
            <div className="flex items-center gap-1.5 mb-1">{estadoIcon[e]}<span className="text-xs font-semibold">{e}</span></div>
            <p className="text-2xl font-black">{counts[e] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{filtered.length} inscripciones</p>
        <button onClick={() => setFilterEstado("TODOS")} className={`text-xs px-3 py-1.5 rounded-full border transition ${filterEstado === "TODOS" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
          Ver todas
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <AcademicCapIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No hay inscripciones aún.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((i) => (
            <div key={i.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-[1fr_auto] gap-0">
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estadoBadge[i.estado]}`}>
                      {estadoIcon[i.estado]}{i.estado}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">{i.curso}</span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">Nivel {i.nivel}</span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-semibold">{i.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{i.email}</span>
                    </div>
                    {i.telefono && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{i.telefono}</span>
                      </div>
                    )}
                  </div>

                  {i.mensaje && (
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">"{i.mensaje}"</p>
                  )}

                  {i.fechaProgramada && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-700 font-semibold">
                      <CalendarDaysIcon className="w-4 h-4" />
                      Programado: {new Date(i.fechaProgramada).toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}

                  {i.notaAdmin && (
                    <p className="mt-1 text-xs text-gray-500 italic">Nota: {i.notaAdmin}</p>
                  )}

                  <p className="mt-2 text-[10px] text-gray-400">
                    Inscrito el {new Date(i.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-gray-100 p-4 flex flex-col gap-2 justify-center">
                  <button onClick={() => handleEdit(i)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <PencilIcon className="w-4 h-4" /> Gestionar
                  </button>
                  <a href={`https://wa.me/${i.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${i.nombre}, te contactamos de Rossy Resina sobre tu inscripción al curso: ${i.curso}.`)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 text-sm font-semibold text-green-700 hover:bg-green-50">
                    <PhoneIcon className="w-4 h-4" /> WhatsApp
                  </a>
                  <button onClick={() => handleDelete(i.id)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50">
                    <TrashIcon className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              </div>

              {/* Panel de edición */}
              {editingId === i.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Estado</label>
                    <select value={editForm.estado} onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                      {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Fecha programada</label>
                    <input type="datetime-local" value={editForm.fechaProgramada}
                      onChange={(e) => setEditForm({ ...editForm, fechaProgramada: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Nota interna</label>
                    <input value={editForm.notaAdmin} onChange={(e) => setEditForm({ ...editForm, notaAdmin: e.target.value })}
                      placeholder="Ej: Confirmado por WhatsApp"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                  </div>
                  <div className="md:col-span-3 flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100">Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60">
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { redirect: { destination: "/admin/sign-in", permanent: false } };
  }
  return { props: {} };
};
