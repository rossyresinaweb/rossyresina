import Head from "next/head";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { videos, shorts, type VideoItem } from "@/data/capacitaciones";
import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
  HomeIcon,
  AcademicCapIcon,
  BeakerIcon,
  SwatchIcon,
  Square2StackIcon,
  SparklesIcon,
  ArchiveBoxIcon,
  StarIcon,
  ClockIcon,
  CalendarDaysIcon,
  FilmIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { courseCatalog, getCourseAvailability, type CourseMode } from "@/lib/courseCatalog";

type TallerSlot = {
  id: string;
  cursoNombre: string;
  cursoNivel: string;
  fecha: string;
  duracionHoras: number;
  precio: number;
  cupoMax: number;
  inscripciones: { id: string }[];
};

const formatDate = (v: string) => new Date(v).toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" });
const formatTime = (v: string) => new Date(v).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const TAGS = ["Todos", ...Array.from(new Set(videos.map((v) => v.tag)))];

const SidebarItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-full rounded-xl px-2 py-3 text-[10px] font-semibold transition ${active ? "bg-gray-100" : "hover:bg-gray-100"}`}>
    <span className="w-6 h-6">{icon}</span>
    <span className="text-gray-700">{label}</span>
  </button>
);

function VideoCard({ v }: { v: VideoItem }) {
  return (
    <Link href={`/capacitaciones/${v.id}`} className="group flex flex-col gap-2">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-800 flex flex-col items-center justify-center">
        <VideoCameraIcon className="w-10 h-10 text-gray-600" />
        <p className="text-gray-500 text-[11px] mt-1">Video en proceso</p>
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">
          {v.duration}
        </span>
      </div>
      <div className="flex gap-2">
        <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-amazon_blue flex items-center justify-center text-white text-xs font-bold">
          RR
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-black">
            {v.title}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 hover:text-gray-900">Rossy Resina</p>
          <p className="text-xs text-gray-500">{v.views} vistas · {v.date}</p>
        </div>
      </div>
    </Link>
  );
}

export default function CapacitacionesPage() {
  const [activeTab, setActiveTab] = useState<"videos" | "shorts" | "cursos" | "talleres">("videos");
  const [activeTag, setActiveTag] = useState("Todos");
  const [query, setQuery] = useState("");
  const [courseMode, setCourseMode] = useState<"Todos" | CourseMode>("Todos");
  const [courseQuery, setCourseQuery] = useState("");
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [adminVideos, setAdminVideos] = useState<any[]>([]);
  const [adminShorts, setAdminShorts] = useState<any[]>([]);

  // Talleres
  const [slots, setSlots] = useState<TallerSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", notas: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const c = localStorage.getItem("rr_admin_courses");
      if (c) setAdminCourses(JSON.parse(c));
      const v = localStorage.getItem("rr_admin_videos");
      if (v) setAdminVideos(JSON.parse(v));
      const s = localStorage.getItem("rr_admin_shorts");
      if (s) setAdminShorts(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === "talleres") {
      fetch("/api/talleres/slots").then((r) => r.json()).then(setSlots).catch(() => {});
    }
  }, [activeTab]);

  const handleInscribirse = async () => {
    if (!selectedSlot || !form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) {
      setFormError("Por favor completa nombre, email y teléfono.");
      return;
    }
    setSending(true);
    setFormError("");
    const res = await fetch("/api/talleres/inscripciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: selectedSlot, ...form }),
    });
    setSending(false);
    if (res.ok) {
      setSuccess(true);
      setForm({ nombre: "", email: "", telefono: "", notas: "" });
      setSelectedSlot(null);
      // Refrescar slots
      fetch("/api/talleres/slots").then((r) => r.json()).then(setSlots).catch(() => {});
    } else {
      const data = await res.json();
      setFormError(data.error || "Error al inscribirse");
    }
  };

  // Agrupar slots por semana
  const slotsByWeek = useMemo(() => {
    const available = slots.filter((s) => s.inscripciones.length < s.cupoMax);
    const groups: Record<string, TallerSlot[]> = {};
    available.forEach((s) => {
      const d = new Date(s.fecha);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const key = monday.toISOString().slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  const allCourses = useMemo(() => [...courseCatalog, ...adminCourses], [adminCourses]);
  const allVideos = useMemo(() => [...videos, ...adminVideos], [adminVideos]);
  const allShorts = useMemo(() => [...shorts, ...adminShorts], [adminShorts]);

  const filteredCourses = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    return allCourses.filter((course) => {
      const matchMode = courseMode === "Todos" || course.mode === courseMode;
      if (!matchMode) return false;
      if (!q) return true;
      return `${course.title} ${course.summary} ${course.city} ${course.level}`.toLowerCase().includes(q);
    });
  }, [courseQuery, courseMode, allCourses]);

  const filtered = useMemo(() => {
    return allVideos.filter((v) => {
      const matchTag = activeTag === "Todos" || v.tag === activeTag;
      const q = query.trim().toLowerCase();
      const matchQuery = !q || v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q);
      return matchTag && matchQuery;
    });
  }, [activeTag, query, allVideos]);

  return (
    <>
      <Head>
        <title>Capacitaciones | Rossy Resina</title>
        <meta name="description" content="Videos y tutoriales de resina epóxica, moldes y pigmentos." />
      </Head>

      <div className="min-h-screen bg-white flex flex-col">

        {/* HEADER tipo YouTube */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1 shrink-0">
            <svg className="w-8 h-8 text-amazon_blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 15l5.19-3L10 9v6zm11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
            </svg>
            <span className="text-base font-bold text-gray-900 leading-none">Rossy<br /><span className="text-[10px] font-semibold text-gray-500 tracking-widest">CAPACITACIONES</span></span>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex flex-1 max-w-xl mx-auto items-center">
            <div className="flex flex-1 items-center border border-gray-300 rounded-l-full px-4 h-10 focus-within:border-blue-500">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar"
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
            <button className="h-10 px-5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Iconos derecha */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={() => setActiveTab("videos")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                activeTab === "videos" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:text-gray-900"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab("shorts")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                activeTab === "shorts" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:text-gray-900"
              }`}
            >
              <FilmIcon className="w-4 h-4" />
              Shorts
            </button>
            <button
              onClick={() => setActiveTab("talleres")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition flex items-center gap-1 ${
                activeTab === "talleres" ? "bg-rose-600 text-white border-rose-600" : "border-gray-300 text-gray-600 hover:text-gray-900"
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4" />
              Talleres
            </button>
          </div>
        </header>

        <div className="flex flex-1">
          {/* SIDEBAR izquierdo tipo YouTube */}
          <aside className="hidden md:flex flex-col w-20 shrink-0 pt-2 px-1 gap-1 border-r border-gray-100">
            <SidebarItem active={activeTab === "videos"} onClick={() => setActiveTab("videos")} icon={<HomeIcon className="w-6 h-6" />} label="Inicio" />
            <SidebarItem active={activeTab === "shorts"} onClick={() => setActiveTab("shorts")} icon={<FilmIcon className="w-6 h-6" />} label="Shorts" />
            <SidebarItem active={activeTab === "cursos"} onClick={() => setActiveTab("cursos")} icon={<AcademicCapIcon className="w-6 h-6" />} label="Cursos" />
            <SidebarItem active={activeTab === "talleres"} onClick={() => setActiveTab("talleres")} icon={<CalendarDaysIcon className="w-6 h-6" />} label="Talleres" />
            <SidebarItem icon={<BeakerIcon className="w-6 h-6" />} label="Resina" />
            <SidebarItem icon={<SwatchIcon className="w-6 h-6" />} label="Pigmentos" />
            <SidebarItem icon={<Square2StackIcon className="w-6 h-6" />} label="Moldes" />
            <SidebarItem icon={<SparklesIcon className="w-6 h-6" />} label="Acabados" />
            <SidebarItem icon={<ArchiveBoxIcon className="w-6 h-6" />} label="Accesorios" />
            <div className="my-2 border-t border-gray-200" />
            <SidebarItem icon={<StarIcon className="w-6 h-6" />} label="Destacados" />
            <SidebarItem icon={<ClockIcon className="w-6 h-6" />} label="Recientes" />
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main className="flex-1 min-w-0">
            {activeTab === "videos" ? (
              <>
                {/* Chips de filtros */}
                <div className="sticky top-14 z-10 bg-white border-b border-gray-100 px-4 py-2">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                          activeTag === tag ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Grid de videos */}
                <div className="px-4 py-5">
                  {filtered.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">No hay videos con ese filtro.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                      {filtered.map((v) => (
                        <VideoCard key={v.id} v={v} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : activeTab === "shorts" ? (
              <div className="px-4 py-5">
                {allShorts.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">
                    <FilmIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-semibold">Próximamente</p>
                    <p className="text-xs text-gray-400 mt-1">Los shorts estarán disponibles pronto</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {allShorts.map((s) => (
                      <div key={s.id} className="flex flex-col gap-2">
                        <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-gray-800 flex flex-col items-center justify-center">
                          <FilmIcon className="w-8 h-8 text-gray-600" />
                          <p className="text-gray-500 text-[10px] mt-1">Short en proceso</p>
                          {s.duration && <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">{s.duration}</span>}
                        </div>
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2">{s.title}</p>
                        <p className="text-[10px] text-gray-500">{s.views} vistas · {s.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "cursos" ? (
              <div className="px-4 py-5">
                {/* Filtros cursos */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-5">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="flex items-center border border-gray-300 rounded-xl px-4 h-11 focus-within:border-gray-900">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                      <input
                        value={courseQuery}
                        onChange={(e) => setCourseQuery(e.target.value)}
                        placeholder="Buscar curso por nombre, nivel o ciudad"
                        className="flex-1 text-sm outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      {(["Todos", "Presencial", "Virtual", "Hibrido"] as const).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCourseMode(item)}
                          className={`shrink-0 h-10 rounded-full px-4 text-sm font-semibold transition ${
                            courseMode === item ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de cursos */}
                <div className="grid gap-4">
                  {filteredCourses.map((course) => {
                    const availability = getCourseAvailability(course);
                    const seatsLeft = Math.max(0, course.totalSeats - course.soldSeats);
                    const tone = availability.tone;
                    const badgeClass = tone === "soldout" ? "bg-rose-50 text-rose-700 border-rose-200" : tone === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
                    return (
                      <article key={course.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="grid md:grid-cols-[1fr_200px]">
                          <div className="p-4 md:p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>{availability.label}</span>
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{course.mode}</span>
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">Nivel {course.level}</span>
                            </div>
                            <h2 className="mt-3 text-lg font-extrabold text-gray-900">{course.title}</h2>
                            <p className="mt-1 text-sm text-gray-600">{course.summary}</p>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                              <p><span className="font-semibold">Fecha:</span> {formatDate(course.startAt)}</p>
                              <p><span className="font-semibold">Hora:</span> {formatTime(course.startAt)}</p>
                              <p><span className="font-semibold">Sede:</span> {course.city}</p>
                              <p><span className="font-semibold">Duración:</span> {course.durationHours} h</p>
                            </div>
                          </div>
                          <div className="border-t md:border-t-0 md:border-l border-dashed border-gray-200 bg-gray-50 p-4 flex flex-col justify-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Entrada general</p>
                            <p className="mt-1 text-3xl font-black text-gray-900">S/ {course.price.toFixed(2)}</p>
                            {typeof course.oldPrice === "number" && (
                              <p className="text-sm text-gray-400 line-through">S/ {course.oldPrice.toFixed(2)}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-600">{seatsLeft} vacantes</p>
                            <Link
                              href={`/capacitaciones-preview/${course.id}`}
                              className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-bold text-white hover:bg-black"
                            >
                              Ver detalle
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {filteredCourses.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                      No encontramos cursos con ese filtro.
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === "talleres" ? (
              <div className="px-4 py-5 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-gray-900">Talleres con Rossy</h2>
                  <p className="text-sm text-gray-500 mt-1">Elige el horario que más te convenga y reserva tu lugar. Máximo 6 personas por taller.</p>
                </div>

                {success && (
                  <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 font-semibold">
                    ✅ ¡Inscripción exitosa! Rossy se pondrá en contacto contigo por WhatsApp para confirmar los detalles.
                    <button onClick={() => setSuccess(false)} className="ml-3 text-xs underline">Cerrar</button>
                  </div>
                )}

                {slotsByWeek.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                    <CalendarDaysIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold">No hay horarios disponibles por ahora</p>
                    <p className="text-xs text-gray-400 mt-1">Vuelve pronto, Rossy publicará nuevas fechas.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {slotsByWeek.map(([weekKey, weekSlots]) => {
                      const weekStart = new Date(weekKey + "T00:00:00");
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      const label = `Semana del ${weekStart.toLocaleDateString("es-PE", { day: "2-digit", month: "long" })} al ${weekEnd.toLocaleDateString("es-PE", { day: "2-digit", month: "long" })}`;
                      return (
                        <div key={weekKey}>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{label}</p>
                          <div className="grid gap-3">
                            {weekSlots.map((slot) => {
                              const inscritas = slot.inscripciones.length;
                              const vacantes = slot.cupoMax - inscritas;
                              const isSelected = selectedSlot === slot.id;
                              return (
                                <div key={slot.id} className={`rounded-xl border-2 transition cursor-pointer ${isSelected ? "border-rose-500 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-300"}`}
                                  onClick={() => { setSelectedSlot(isSelected ? null : slot.id); setSuccess(false); setFormError(""); }}
                                >
                                  <div className="flex items-center gap-4 p-4">
                                    <div className="shrink-0 text-center w-12">
                                      <p className="text-xs font-semibold text-gray-500 uppercase">{new Date(slot.fecha).toLocaleDateString("es-PE", { weekday: "short" })}</p>
                                      <p className="text-2xl font-black text-gray-900 leading-none">{new Date(slot.fecha).getDate()}</p>
                                      <p className="text-xs text-gray-500">{new Date(slot.fecha).toLocaleDateString("es-PE", { month: "short" })}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-900">{slot.cursoNombre}</p>
                                      <p className="text-xs text-gray-500">{new Date(slot.fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })} · {slot.duracionHoras}h · Nivel {slot.cursoNivel}</p>
                                      <div className="mt-1 flex gap-2 items-center">
                                        <span className="text-sm font-extrabold text-gray-900">S/ {Number(slot.precio).toFixed(2)}</span>
                                        <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                                          <UserGroupIcon className="w-3.5 h-3.5" /> {vacantes} lugar{vacantes !== 1 ? "es" : ""} disponible{vacantes !== 1 ? "s" : ""}
                                        </span>
                                      </div>
                                    </div>
                                    <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-rose-500 bg-rose-500" : "border-gray-300"}`}>
                                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                  </div>

                                  {isSelected && (
                                    <div className="border-t border-rose-200 px-4 pb-4 pt-3" onClick={(e) => e.stopPropagation()}>
                                      <p className="text-xs font-bold text-gray-700 mb-3">Completa tus datos para reservar</p>
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        <div>
                                          <label className="text-xs font-semibold text-gray-600">Nombre completo *</label>
                                          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-500" placeholder="Tu nombre" />
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold text-gray-600">WhatsApp *</label>
                                          <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-500" placeholder="+51 999 999 999" />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="text-xs font-semibold text-gray-600">Email *</label>
                                          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-500" placeholder="tu@email.com" />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="text-xs font-semibold text-gray-600">Notas (opcional)</label>
                                          <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-500" placeholder="Alguna consulta o comentario" />
                                        </div>
                                      </div>
                                      {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
                                      <button
                                        onClick={handleInscribirse}
                                        disabled={sending}
                                        className="mt-3 w-full h-11 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 disabled:opacity-60"
                                      >
                                        {sending ? "Reservando..." : "🎨 Reservar mi lugar"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
