import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getServerSession } from "next-auth/next";
import type { GetServerSideProps } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  courseCatalog,
  getCourseAvailability,
  type CourseItem,
  type CourseMode,
} from "@/lib/courseCatalog";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

const availabilityClass = (course: CourseItem) => {
  const status = getCourseAvailability(course).tone;
  if (status === "soldout") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "warning") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

export default function CapacitacionesPreviewPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"Todos" | CourseMode>("Todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courseCatalog.filter((course) => {
      const matchesMode = mode === "Todos" || course.mode === mode;
      if (!matchesMode) return false;
      if (!q) return true;
      const haystack = `${course.title} ${course.summary} ${course.city} ${course.level} ${course.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, mode]);

  return (
    <>
      <Head>
        <title>Preview Capacitaciones | Rossy Resina</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
      </Head>

      <main className="min-h-screen bg-[#f5f6fb] text-[#141824]">
        <section className="mx-auto max-w-screen-2xl px-4 pt-6 pb-3 md:px-6">
          <div className="rounded-2xl bg-gradient-to-r from-[#111827] to-[#2f1554] p-5 text-white md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Preview privado</p>
            <h1 className="mt-2 text-2xl font-extrabold md:text-4xl">Cursos y talleres con cupos reales</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/80 md:text-base">
              Vista de trabajo. Publico general sigue viendo mantenimiento en /capacitaciones.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-4 pb-8 md:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar curso por nombre, nivel o ciudad"
                className="h-11 rounded-xl border border-gray-300 px-4 text-sm outline-none focus:border-[#2f1554]"
              />
              <div className="inline-flex items-center gap-2 overflow-x-auto no-scrollbar">
                {(["Todos", "Presencial", "Virtual", "Hibrido"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`h-10 rounded-full px-4 text-sm font-semibold transition ${
                      mode === item
                        ? "bg-[#2f1554] text-white"
                        : "bg-[#f3f4f6] text-gray-700 hover:bg-[#e8ebf3]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {filtered.map((course) => {
              const availability = getCourseAvailability(course);
              const seatsLeft = Math.max(0, course.totalSeats - course.soldSeats);
              return (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="grid md:grid-cols-[220px_1fr_215px]">
                    <div
                      className="relative min-h-[170px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${course.cover})` }}
                    />

                    <div className="p-4 md:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${availabilityClass(course)}`}>
                          {availability.label}
                        </span>
                        <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#3730a3]">
                          {course.mode}
                        </span>
                        <span className="rounded-full bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-gray-700">
                          Nivel {course.level}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-extrabold text-[#111827]">{course.title}</h2>
                      <p className="mt-1 text-sm text-gray-600">{course.summary}</p>

                      <div className="mt-4 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                        <p><span className="font-semibold">Fecha:</span> {formatDate(course.startAt)}</p>
                        <p><span className="font-semibold">Hora:</span> {formatTime(course.startAt)}</p>
                        <p><span className="font-semibold">Sede:</span> {course.city}</p>
                        <p><span className="font-semibold">Duracion:</span> {course.durationHours} h</p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 bg-[#fafafa] p-4 md:border-l md:border-t-0 md:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Entrada general</p>
                      <p className="mt-1 text-4xl font-black text-[#111827]">S/ {course.price.toFixed(2)}</p>
                      {typeof course.oldPrice === "number" ? (
                        <p className="text-sm text-gray-400 line-through">S/ {course.oldPrice.toFixed(2)}</p>
                      ) : null}
                      <p className="mt-2 text-sm text-gray-600">{seatsLeft} vacantes disponibles</p>

                      <div className="mt-4 flex flex-col gap-2">
                        <Link
                          href={`/capacitaciones-preview/${course.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#111827] px-4 text-sm font-bold text-white hover:bg-black"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                No encontramos cursos con ese filtro.
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

