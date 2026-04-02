import { useState } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const CURSOS = [
  "Resina Epóxica desde Cero",
  "Moldes de Silicona Pro",
  "Resina UV para Joyería",
  "Pigmentos y Efectos Especiales",
  "Acabados y Pulido Profesional",
  "Emprendimiento con Resina",
];

const NIVELES = ["Basico", "Intermedio", "Avanzado"];

export default function FormularioInscripcion() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", curso: CURSOS[0], nivel: "Basico", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim() || !form.email.trim()) {
      setError("Nombre y correo son requeridos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/capacitaciones/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "No se pudo enviar. Intenta de nuevo.");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircleIcon className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
        <h3 className="text-lg font-bold text-emerald-800">¡Inscripción recibida!</h3>
        <p className="mt-2 text-sm text-emerald-700">
          Nos pondremos en contacto contigo para coordinar la fecha y hora del curso. 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-amazon_blue/10 flex items-center justify-center">
          <AcademicCapIcon className="w-5 h-5 text-amazon_blue" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Inscríbete a un curso</h3>
          <p className="text-xs text-gray-500">Sin fecha fija · Coordinamos contigo el día ideal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Nombre completo *</label>
            <div className="relative mt-1">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre"
                className="w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-amazon_blue" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Correo electrónico *</label>
            <div className="relative mt-1">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@correo.com"
                className="w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-amazon_blue" />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">WhatsApp / Teléfono</label>
            <div className="relative mt-1">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="999 999 999"
                className="w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-amazon_blue" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Nivel</label>
            <select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="mt-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amazon_blue">
              {NIVELES.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Curso de interés</label>
          <select value={form.curso} onChange={(e) => setForm({ ...form, curso: e.target.value })}
            className="mt-1 w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-amazon_blue">
            {CURSOS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Mensaje adicional (opcional)</label>
          <textarea value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            placeholder="¿Tienes alguna pregunta o preferencia de horario?"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amazon_blue min-h-[80px] resize-none" />
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading}
          className="h-11 rounded-xl bg-amazon_blue text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-60">
          {loading ? "Enviando..." : "Inscribirme al curso →"}
        </button>

        <p className="text-[11px] text-gray-400 text-center">
          Te contactaremos por WhatsApp o correo para coordinar la fecha. Sin compromiso.
        </p>
      </form>
    </div>
  );
}
