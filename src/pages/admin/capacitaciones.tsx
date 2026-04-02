import { useState, useEffect, useRef } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PlusIcon, PencilIcon, TrashIcon, VideoCameraIcon, AcademicCapIcon, FilmIcon, UserGroupIcon, ChevronDownIcon, ChevronUpIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { VideoItem, ShortItem } from "@/data/capacitaciones";

type CursoFecha = {
  id: string;
  fecha: string;
  inscripciones: { id: string; nombre: string; email: string; telefono: string; notas: string; createdAt: string }[];
};

type Curso = {
  id: string;
  nombre: string;
  nivel: string;
  descripcion: string;
  modalidad: string;
  ciudad: string;
  sede: string;
  duracionHoras: number;
  precio: number;
  precioAnterior: number | null;
  cupoMax: number;
  imagen: string;
  notaAdmin: string;
  fechas: CursoFecha[];
};

const emptyCurso = () => ({ nombre: "", nivel: "Basico", descripcion: "", modalidad: "Presencial", ciudad: "", sede: "", duracionHoras: 2, precio: 0, precioAnterior: "", cupoMax: 6, imagen: "", notaAdmin: "" });

const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const fmtHora = (iso: string) => new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
const waLink = (tel: string, msg: string) => `https://wa.me/${tel.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;

const LEVELS = ["Basico", "Intermedio", "Avanzado"];
const TAGS = ["Resina epoxica", "Moldes", "Pigmentos", "Ecoresina", "Acabados", "Accesorios", "Resina UV", "Personalizados"];

const emptyVideo = (): Omit<VideoItem, "id"> => ({
  title: "", desc: "", duration: "", views: "0", date: "Reciente", level: "Basico", tag: "Resina epoxica", thumb: "",
});

const emptyShort = (): Omit<ShortItem, "id"> => ({
  title: "", desc: "", duration: "", views: "0", date: "Reciente", tag: "Resina epoxica", thumb: "",
});

export default function AdminCapacitacionesPage() {
  const [tab, setTab] = useState<"videos" | "shorts" | "cursos">("videos");

  // Cursos state
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoForm, setCursoForm] = useState(emptyCurso());
  const [editingCursoId, setEditingCursoId] = useState<string | null>(null);
  const [showCursoForm, setShowCursoForm] = useState(false);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [uploadingFlyer, setUploadingFlyer] = useState(false);
  // Fechas del formulario (nuevas a agregar)
  const [fechasForm, setFechasForm] = useState<string[]>([]);
  const [nuevaFecha, setNuevaFecha] = useState("");
  // Fechas a eliminar al editar
  const [fechasRemove, setFechasRemove] = useState<string[]>([]);
  const flyerInputRef = useRef<HTMLInputElement>(null);

  const fetchCursos = async () => {
    setLoadingCursos(true);
    const res = await fetch("/api/talleres/cursos");
    if (res.ok) setCursos(await res.json());
    setLoadingCursos(false);
  };

  useEffect(() => { if (tab === "cursos") fetchCursos(); }, [tab]);

  const handleFlyerUpload = async (file: File) => {
    setUploadingFlyer(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as string;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, data }),
      });
      if (res.ok) {
        const { url } = await res.json();
        setCursoForm((f) => ({ ...f, imagen: url }));
      }
      setUploadingFlyer(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCurso = async () => {
    if (!cursoForm.nombre.trim()) { alert("El nombre del curso es requerido"); return; }
    if (cursoForm.precio === null || cursoForm.precio === undefined || String(cursoForm.precio).trim() === "") { alert("El precio es requerido"); return; }
    if (!editingCursoId && fechasForm.length === 0) {
      alert("Agrega al menos una fecha disponible");
      return;
    }
    const method = editingCursoId ? "PATCH" : "POST";
    const body = editingCursoId
      ? { id: editingCursoId, ...cursoForm, fechasAdd: fechasForm, fechasRemove }
      : { ...cursoForm, fechas: fechasForm };
    const res = await fetch("/api/talleres/cursos", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await fetchCursos();
      setCursoForm(emptyCurso());
      setFechasForm([]);
      setFechasRemove([]);
      setNuevaFecha("");
      setEditingCursoId(null);
      setShowCursoForm(false);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Error al guardar el curso");
    }
  };

  const handleEditCurso = (c: Curso) => {
    setCursoForm({
      nombre: c.nombre, nivel: c.nivel, descripcion: c.descripcion,
      modalidad: c.modalidad, ciudad: c.ciudad, sede: c.sede,
      duracionHoras: c.duracionHoras, precio: c.precio,
      precioAnterior: c.precioAnterior ?? "", cupoMax: c.cupoMax,
      imagen: c.imagen, notaAdmin: c.notaAdmin,
    });
    setFechasForm([]);
    setFechasRemove([]);
    setNuevaFecha("");
    setEditingCursoId(c.id);
    setShowCursoForm(true);
  };

  const handleDeleteCurso = async (id: string) => {
    if (!confirm("¿Eliminar este curso? Se eliminarán también sus fechas e inscripciones.")) return;
    await fetch(`/api/talleres/cursos?id=${id}`, { method: "DELETE" });
    await fetchCursos();
  };

  const addFechaToForm = () => {
    if (!nuevaFecha) return;
    setFechasForm((prev) => [...prev, nuevaFecha]);
    setNuevaFecha("");
  };

  const removeFechaFromForm = (idx: number) => {
    setFechasForm((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleFechaRemove = (fechaId: string) => {
    setFechasRemove((prev) =>
      prev.includes(fechaId) ? prev.filter((id) => id !== fechaId) : [...prev, fechaId]
    );
  };

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

  // Cargar datos desde localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem("rr_admin_videos");
      if (v) setVideos(JSON.parse(v));
      const s = localStorage.getItem("rr_admin_shorts");
      if (s) setShorts(JSON.parse(s));
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

  const editingCurso = editingCursoId ? cursos.find((curso) => curso.id === editingCursoId) : null;

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gestión de Capacitaciones</h1>
        <div className="flex gap-2 flex-wrap">
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
            <p className="text-sm text-gray-500">{cursos.length} cursos registrados</p>
            <button
              onClick={() => { setCursoForm(emptyCurso()); setEditingCursoId(null); setShowCursoForm(true); setFechasForm([]); setFechasRemove([]); setNuevaFecha(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amazon_blue text-white text-sm font-semibold hover:brightness-95"
            >
              <PlusIcon className="w-4 h-4" /> Agregar curso
            </button>
          </div>

          {showCursoForm && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-4">{editingCursoId ? "Editar curso" : "Nuevo curso"}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Titulo *</label>
                  <input value={cursoForm.nombre} onChange={(e) => setCursoForm({ ...cursoForm, nombre: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Ej: Curso de Eco Resina" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Descripcion</label>
                  <textarea value={cursoForm.descripcion} onChange={(e) => setCursoForm({ ...cursoForm, descripcion: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900 min-h-[80px]" placeholder="Descripcion del curso" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Modalidad</label>
                  <select value={cursoForm.modalidad} onChange={(e) => setCursoForm({ ...cursoForm, modalidad: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                    <option>Presencial</option>
                    <option>Virtual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nivel</label>
                  <select value={cursoForm.nivel} onChange={(e) => setCursoForm({ ...cursoForm, nivel: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900">
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Ciudad</label>
                  <input value={cursoForm.ciudad} onChange={(e) => setCursoForm({ ...cursoForm, ciudad: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Lima / Online" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Sede / Plataforma</label>
                  <input value={cursoForm.sede} onChange={(e) => setCursoForm({ ...cursoForm, sede: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Studio Rossy / Zoom" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Duracion (horas)</label>
                  <input type="number" min={1} value={cursoForm.duracionHoras} onChange={(e) => setCursoForm({ ...cursoForm, duracionHoras: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Total cupos (max. 6)</label>
                  <input type="number" min={1} max={6} value={cursoForm.cupoMax} onChange={(e) => setCursoForm({ ...cursoForm, cupoMax: Math.min(6, Number(e.target.value)) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Precio (S/) *</label>
                  <input type="number" min={0} value={cursoForm.precio} onChange={(e) => setCursoForm({ ...cursoForm, precio: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Precio anterior (S/)</label>
                  <input type="number" min={0} value={cursoForm.precioAnterior} onChange={(e) => setCursoForm({ ...cursoForm, precioAnterior: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Opcional" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Flyer (opcional)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      ref={flyerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFlyerUpload(file);
                        if (flyerInputRef.current) flyerInputRef.current.value = "";
                      }}
                    />
                    <button type="button" onClick={() => flyerInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      <PhotoIcon className="w-4 h-4" />
                      {uploadingFlyer ? "Subiendo..." : "Subir imagen"}
                    </button>
                    {cursoForm.imagen && <span className="text-xs text-emerald-700 font-semibold">Imagen cargada</span>}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Nota interna (opcional)</label>
                  <input value={cursoForm.notaAdmin} onChange={(e) => setCursoForm({ ...cursoForm, notaAdmin: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" placeholder="Ej: Taller presencial en el studio" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Agregar fecha y hora *</label>
                  <div className="mt-1 flex gap-2">
                    <input type="datetime-local" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-slate-900" />
                    <button type="button" onClick={addFechaToForm} className="shrink-0 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Agregar</button>
                  </div>
                </div>

                {fechasForm.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Fechas nuevas</p>
                    <div className="flex flex-wrap gap-2">
                      {fechasForm.map((fecha, idx) => (
                        <span key={`${fecha}-${idx}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                          {fmtFecha(fecha)} {fmtHora(fecha)}
                          <button type="button" onClick={() => removeFechaFromForm(idx)} className="rounded-full hover:bg-gray-200">
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {editingCurso && editingCurso.fechas.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Fechas existentes (marca para eliminar)</p>
                    <div className="grid gap-2">
                      {editingCurso.fechas.map((f) => (
                        <label key={f.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                          <span>{fmtFecha(f.fecha)} {fmtHora(f.fecha)}</span>
                          <input type="checkbox" checked={fechasRemove.includes(f.id)} onChange={() => toggleFechaRemove(f.id)} />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {cursoForm.imagen && (
                <div className="mt-4">
                  <img src={cursoForm.imagen} alt="Flyer del curso" className="max-h-44 rounded-lg border border-gray-200 object-cover" />
                </div>
              )}

              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => { setShowCursoForm(false); setEditingCursoId(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveCurso} className="px-4 py-2 rounded-lg bg-amazon_blue text-white text-sm font-semibold hover:brightness-95">{editingCursoId ? "Guardar cambios" : "Agregar curso"}</button>
              </div>
            </div>
          )}

          {loadingCursos ? (
            <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
          ) : cursos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay cursos. Agrega el primero.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {cursos.map((curso) => {
                const totalInscritas = curso.fechas.reduce((acc, fecha) => acc + fecha.inscripciones.length, 0);
                const expanded = expandedCurso === curso.id;
                return (
                  <div key={curso.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{curso.nombre}</p>
                        <p className="text-xs text-gray-500">{curso.modalidad} · {curso.duracionHoras}h · Nivel {curso.nivel}</p>
                        <div className="mt-1 flex gap-2 flex-wrap items-center">
                          <span className="text-xs font-bold text-gray-900">S/ {Number(curso.precio).toFixed(2)}</span>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700">{curso.fechas.length} fechas</span>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">{totalInscritas} inscritas</span>
                          {curso.notaAdmin && <span className="text-[10px] text-gray-400 truncate">{curso.notaAdmin}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 items-center">
                        <button onClick={() => setExpandedCurso(expanded ? null : curso.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                          <UserGroupIcon className="w-4 h-4" /> {totalInscritas}
                          {expanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                        </button>
                        <button onClick={() => handleEditCurso(curso)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><PencilIcon className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => handleDeleteCurso(curso.id)} className="p-2 rounded-lg border border-red-200 hover:bg-red-50"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                        {curso.descripcion && <p className="text-xs text-gray-500 mb-3">{curso.descripcion}</p>}
                        {curso.fechas.length === 0 ? (
                          <p className="text-xs text-gray-400">Este curso no tiene fechas registradas.</p>
                        ) : (
                          <div className="grid gap-2">
                            {curso.fechas.map((fecha) => (
                              <div key={fecha.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="text-xs font-semibold text-gray-700">{fmtFecha(fecha.fecha)} · {fmtHora(fecha.fecha)}</p>
                                  <span className="text-xs text-gray-500">{fecha.inscripciones.length}/{curso.cupoMax} inscritas</span>
                                </div>
                                {fecha.inscripciones.length === 0 ? (
                                  <p className="text-xs text-gray-400">Aun no hay inscritas para esta fecha.</p>
                                ) : (
                                  <div className="grid gap-2">
                                    {fecha.inscripciones.map((ins) => (
                                      <div key={ins.id} className="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-gray-900">{ins.nombre}</p>
                                          <p className="text-xs text-gray-500">{ins.email} · {ins.telefono}</p>
                                          {ins.notas && <p className="text-xs text-gray-400 italic">{ins.notas}</p>}
                                        </div>
                                        <a href={waLink(ins.telefono, `Hola ${ins.nombre}! Te escribo de Rossy Resina para confirmar tu inscripcion al taller "${curso.nombre}" el ${fmtFecha(fecha.fecha)} a las ${fmtHora(fecha.fecha)}.`)} target="_blank" rel="noreferrer" className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">
                                          Confirmar
                                        </a>
                                        <a href={waLink(ins.telefono, `Hola ${ins.nombre}! Te recordamos que tu taller "${curso.nombre}" es el ${fmtFecha(fecha.fecha)} a las ${fmtHora(fecha.fecha)}.`)} target="_blank" rel="noreferrer" className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600">
                                          Recordatorio
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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


