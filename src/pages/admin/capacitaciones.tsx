import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PlusIcon, PencilIcon, TrashIcon, VideoCameraIcon, AcademicCapIcon, FilmIcon } from "@heroicons/react/24/outline";
import type { VideoItem, ShortItem } from "@/data/capacitaciones";
import type { CourseItem, CourseMode, CourseLevel } from "@/lib/courseCatalog";

const LEVELS = ["Basico", "Intermedio", "Avanzado"];
const TAGS = ["Resina epoxica", "Moldes", "Pigmentos", "Ecoresina", "Acabados", "Accesorios", "Resina UV", "Personalizados"];
const MODES: CourseMode[] = ["Presencial", "Virtual", "Hibrido"];

const emptyVideo = (): Omit<VideoItem, "id"> => ({
  title: "", desc: "", duration: "", views: "0", date: "Reciente", level: "Basico", tag: "Resina epoxica", thumb: "",
});

const emptyShort = (): Omit<ShortItem, "id"> => ({
  title: "", desc: "", duration: "", views: "0", date: "Reciente", tag: "Resina epoxica", thumb: "",
});

const emptyCourse = (): Omit<CourseItem, "id"> => ({
  title: "", summary: "", cover: "", mode: "Virtual", level: "Basico",
  city: "", venue: "", startAt: "", durationHours: 2, totalSeats: 30, soldSeats: 0, price: 0, tags: [],
});

export default function AdminCapacitacionesPage() {
  const [tab, setTab] = useState<"videos" | "shorts" | "cursos">("videos");

  // Videos state
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoForm, setVideoForm] = useState(emptyVideo());
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);

  // Shorts state
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [shortForm, setShortForm] = useState(emptyShort());
  const [editingShortId, setEditingShortId] = useState<string | null>(null);
  const [showShortForm, setShowShortForm] = useState(false);

  // Cursos state
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [courseForm, setCourseForm] = useState(emptyCourse());
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);

  // Cargar datos desde localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem("rr_admin_videos");
      if (v) setVideos(JSON.parse(v));
      const s = localStorage.getItem("rr_admin_shorts");
      if (s) setShorts(JSON.parse(s));
      const c = localStorage.getItem("rr_admin_courses");
      if (c) setCourses(JSON.parse(c));
    } catch {}
  }, []);

  const saveVideos = (list: VideoItem[]) => {
    setVideos(list);
    localStorage.setItem("rr_admin_videos", JSON.stringify(list));
  };

  const saveShorts = (list: ShortItem[]) => {
    setShorts(list);
    localStorage.setItem("rr_admin_shorts", JSON.stringify(list));
  };

  const saveCourses = (list: CourseItem[]) => {
    setCourses(list);
    localStorage.setItem("rr_admin_courses", JSON.stringify(list));
  };

  // VIDEO handlers
  const handleSaveVideo = () => {
    if (!videoForm.title.trim()) return;
    if (editingVideoId) {
      saveVideos(videos.map((v) => v.id === editingVideoId ? { ...videoForm, id: editingVideoId } : v));
    } else {
      const id = `rr-${Date.now()}`;
      saveVideos([...videos, { ...videoForm, id }]);
    }
    setVideoForm(emptyVideo());
    setEditingVideoId(null);
    setShowVideoForm(false);
  };

  const handleEditVideo = (v: VideoItem) => {
    setVideoForm({ title: v.title, desc: v.desc, duration: v.duration, views: v.views, date: v.date, level: v.level, tag: v.tag, thumb: v.thumb });
    setEditingVideoId(v.id);
    setShowVideoForm(true);
  };

  const handleDeleteVideo = (id: string) => {
    if (!confirm("¿Eliminar este video?")) return;
    saveVideos(videos.filter((v) => v.id !== id));
  };

  const handleSaveShort = () => {
    if (!shortForm.title.trim()) return;
    if (editingShortId) {
      saveShorts(shorts.map((s) => s.id === editingShortId ? { ...shortForm, id: editingShortId } : s));
    } else {
      saveShorts([...shorts, { ...shortForm, id: `short-${Date.now()}` }]);
    }
    setShortForm(emptyShort());
    setEditingShortId(null);
    setShowShortForm(false);
  };

  const handleEditShort = (s: ShortItem) => {
    setShortForm({ title: s.title, desc: s.desc, duration: s.duration, views: s.views, date: s.date, tag: s.tag, thumb: s.thumb });
    setEditingShortId(s.id);
    setShowShortForm(true);
  };

  const handleDeleteShort = (id: string) => {
    if (!confirm("¿Eliminar este short?")) return;
    saveShorts(shorts.filter((s) => s.id !== id));
  };

  // CURSO handlers
  const handleSaveCourse = () => {
    if (!courseForm.title.trim()) return;
    if (editingCourseId) {
      saveCourses(courses.map((c) => c.id === editingCourseId ? { ...courseForm, id: editingCourseId } : c));
    } else {
      const id = `curso-${Date.now()}`;
      saveCourses([...courses, { ...courseForm, id }]);
    }
    setCourseForm(emptyCourse());
    setEditingCourseId(null);
    setShowCourseForm(false);
  };

  const handleEditCourse = (c: CourseItem) => {
    setCourseForm({ title: c.title, summary: c.summary, cover: c.cover, mode: c.mode, level: c.level, city: c.city, venue: c.venue, startAt: c.startAt, durationHours: c.durationHours, totalSeats: c.totalSeats, soldSeats: c.soldSeats, price: c.price, oldPrice: c.oldPrice, tags: c.tags });
    setEditingCourseId(c.id);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = (id: string) => {
    if (!confirm("¿Eliminar este curso?")) return;
    saveCourses(courses.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestión de Capacitaciones</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab("videos")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "videos" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            <VideoCameraIcon className="w-4 h-4" /> Videos
          </button>
          <button onClick={() => setTab("shorts")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "shorts" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            <FilmIcon className="w-4 h-4" /> Shorts
          </button>
          <button onClick={() => setTab("cursos")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "cursos" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            <AcademicCapIcon className="w-4 h-4" /> Cursos
          </button>
        </div>
      </div>

      {/* ===== VIDEOS ===== */}
      {tab === "videos" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{videos.length} videos registrados</p>
            <button
              onClick={() => { setVideoForm(emptyVideo()); setEditingVideoId(null); setShowVideoForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amazon_blue text-white text-sm font-semibold hover:brightness-95"
            >
              <PlusIcon className="w-4 h-4" /> Agregar video
            </button>
          </div>

          {showVideoForm && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-4">{editingVideoId ? "Editar video" : "Nuevo video"}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Título *</label>
                  <input value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Título del video" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Descripción</label>
                  <textarea value={videoForm.desc} onChange={(e) => setVideoForm({ ...videoForm, desc: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900 min-h-[80px]" placeholder="Descripción breve del video" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">URL del video (YouTube, Vimeo, etc.)</label>
                  <input value={videoForm.thumb} onChange={(e) => setVideoForm({ ...videoForm, thumb: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Duración (ej: 18:42)</label>
                  <input value={videoForm.duration} onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="18:42" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nivel</label>
                  <select value={videoForm.level} onChange={(e) => setVideoForm({ ...videoForm, level: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Categoría</label>
                  <select value={videoForm.tag} onChange={(e) => setVideoForm({ ...videoForm, tag: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => { setShowVideoForm(false); setEditingVideoId(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveVideo} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black">{editingVideoId ? "Guardar cambios" : "Agregar video"}</button>
              </div>
            </div>
          )}

          {videos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              <VideoCameraIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay videos. Agrega el primero.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {videos.map((v) => (
                <div key={v.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="h-16 w-24 shrink-0 rounded-lg bg-gray-800 flex items-center justify-center">
                    <VideoCameraIcon className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{v.title}</p>
                    <p className="text-xs text-gray-500 truncate">{v.desc}</p>
                    <div className="mt-1 flex gap-2">
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">{v.level}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{v.tag}</span>
                      {v.duration && <span className="text-[10px] text-gray-400">{v.duration}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEditVideo(v)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><PencilIcon className="w-4 h-4 text-gray-600" /></button>
                    <button onClick={() => handleDeleteVideo(v.id)} className="p-2 rounded-lg border border-red-200 hover:bg-red-50"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SHORTS ===== */}
      {tab === "shorts" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{shorts.length} shorts registrados</p>
            <button
              onClick={() => { setShortForm(emptyShort()); setEditingShortId(null); setShowShortForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amazon_blue text-white text-sm font-semibold hover:brightness-95"
            >
              <PlusIcon className="w-4 h-4" /> Agregar short
            </button>
          </div>

          {showShortForm && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-4">{editingShortId ? "Editar short" : "Nuevo short"}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Título *</label>
                  <input value={shortForm.title} onChange={(e) => setShortForm({ ...shortForm, title: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Título del short" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Descripción</label>
                  <textarea value={shortForm.desc} onChange={(e) => setShortForm({ ...shortForm, desc: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900 min-h-[60px]" placeholder="Descripción breve" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">URL del short (YouTube Shorts, TikTok, etc.)</label>
                  <input value={shortForm.thumb} onChange={(e) => setShortForm({ ...shortForm, thumb: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="https://youtube.com/shorts/..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Duración (ej: 0:45)</label>
                  <input value={shortForm.duration} onChange={(e) => setShortForm({ ...shortForm, duration: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="0:45" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Categoría</label>
                  <select value={shortForm.tag} onChange={(e) => setShortForm({ ...shortForm, tag: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => { setShowShortForm(false); setEditingShortId(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveShort} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black">{editingShortId ? "Guardar cambios" : "Agregar short"}</button>
              </div>
            </div>
          )}

          {shorts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              <FilmIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay shorts. Agrega el primero.</p>
              <p className="text-xs text-gray-400 mt-1">Videos cortos de menos de 60 segundos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shorts.map((s) => (
                <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="aspect-[9/16] max-h-48 w-full rounded-lg bg-gray-800 flex flex-col items-center justify-center gap-2 mb-3">
                    <FilmIcon className="w-8 h-8 text-gray-500" />
                    <span className="text-[10px] text-gray-500">Short en proceso</span>
                    {s.duration && <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">{s.duration}</span>}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{s.desc}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{s.tag}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditShort(s)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"><PencilIcon className="w-3.5 h-3.5 text-gray-600" /></button>
                      <button onClick={() => handleDeleteShort(s.id)} className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50"><TrashIcon className="w-3.5 h-3.5 text-red-600" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== CURSOS ===== */}
      {tab === "cursos" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{courses.length} cursos registrados</p>
            <button
              onClick={() => { setCourseForm(emptyCourse()); setEditingCourseId(null); setShowCourseForm(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amazon_blue text-white text-sm font-semibold hover:brightness-95"
            >
              <PlusIcon className="w-4 h-4" /> Agregar curso
            </button>
          </div>

          {showCourseForm && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-4">{editingCourseId ? "Editar curso" : "Nuevo curso"}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Título *</label>
                  <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Nombre del curso" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Descripción</label>
                  <textarea value={courseForm.summary} onChange={(e) => setCourseForm({ ...courseForm, summary: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900 min-h-[80px]" placeholder="Descripción del curso" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Modalidad</label>
                  <select value={courseForm.mode} onChange={(e) => setCourseForm({ ...courseForm, mode: e.target.value as CourseMode })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                    {MODES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nivel</label>
                  <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as CourseLevel })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Ciudad</label>
                  <input value={courseForm.city} onChange={(e) => setCourseForm({ ...courseForm, city: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Lima / Online" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Sede / Plataforma</label>
                  <input value={courseForm.venue} onChange={(e) => setCourseForm({ ...courseForm, venue: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Studio Rossy / Zoom" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Fecha y hora</label>
                  <input type="datetime-local" value={courseForm.startAt} onChange={(e) => setCourseForm({ ...courseForm, startAt: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Duración (horas)</label>
                  <input type="number" value={courseForm.durationHours} onChange={(e) => setCourseForm({ ...courseForm, durationHours: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Precio (S/)</label>
                  <input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Precio anterior (S/)</label>
                  <input type="number" value={courseForm.oldPrice || ""} onChange={(e) => setCourseForm({ ...courseForm, oldPrice: e.target.value ? Number(e.target.value) : undefined })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Opcional" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Total cupos</label>
                  <input type="number" value={courseForm.totalSeats} onChange={(e) => setCourseForm({ ...courseForm, totalSeats: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Cupos vendidos</label>
                  <input type="number" value={courseForm.soldSeats} onChange={(e) => setCourseForm({ ...courseForm, soldSeats: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => { setShowCourseForm(false); setEditingCourseId(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveCourse} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black">{editingCourseId ? "Guardar cambios" : "Agregar curso"}</button>
              </div>
            </div>
          )}

          {courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              <AcademicCapIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay cursos. Agrega el primero.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-500 truncate">{c.summary}</p>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">{c.mode}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">Nivel {c.level}</span>
                      <span className="text-[10px] text-gray-400">{c.city}</span>
                      <span className="text-[10px] font-semibold text-gray-900">S/ {c.price}</span>
                      <span className="text-[10px] text-gray-400">{Math.max(0, c.totalSeats - c.soldSeats)} vacantes</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEditCourse(c)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><PencilIcon className="w-4 h-4 text-gray-600" /></button>
                    <button onClick={() => handleDeleteCourse(c.id)} className="p-2 rounded-lg border border-red-200 hover:bg-red-50"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/capacitaciones", permanent: false } };
  }
  return { props: {} };
};
