import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  findCourseById,
  getCourseAvailability,
  type CourseItem,
} from "@/lib/courseCatalog";

type Props = {
  course: CourseItem | null;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function CapacitacionPreviewDetailPage({ course }: Props) {
  const contactPhoneRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE || "900000000";
  const whatsapp = useMemo(() => contactPhoneRaw.replace(/[^0-9]/g, ""), [contactPhoneRaw]);

  if (!course) {
    return (
      <main className="min-h-screen bg-[#f5f6fb] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#111827]">Curso no encontrado</h1>
          <p className="mt-2 text-sm text-gray-600">La entrada que buscas ya no esta disponible.</p>
          <Link href="/capacitaciones-preview" className="mt-5 inline-flex rounded-lg bg-[#111827] px-5 py-2 text-sm font-semibold text-white">
            Volver a preview
          </Link>
        </div>
      </main>
    );
  }

  const availability = getCourseAvailability(course);
  const seatsLeft = Math.max(0, course.totalSeats - course.soldSeats);
  const waText = `Hola Rossy Resina, quiero reservar el curso: ${course.title}.
-Fecha: ${formatDateTime(course.startAt)}
-Modalidad: ${course.mode}
-Entrada: S/ ${course.price.toFixed(2)}
-Vacantes actuales: ${seatsLeft}`;
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(waText)}`;

  return (
    <>
      <Head>
        <title>{course.title} | Preview Capacitaciones</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
      </Head>
      <main className="min-h-screen bg-[#f5f6fb] px-4 py-6 md:px-6">
        <div className="mx-auto max-w-screen-xl">
          <Link href="/capacitaciones-preview" className="mb-4 inline-flex text-sm font-semibold text-[#3b2a7a] hover:underline">
             Volver a preview
          </Link>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-5 md:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold text-white">
                    {availability.label}
                  </span>
                  <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#3730a3]">
                    {course.mode}
                  </span>
                  <span className="rounded-full bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-gray-700">
                    Nivel {course.level}
                  </span>
                </div>
                <h1 className="mt-3 text-3xl font-black leading-tight text-[#111827]">{course.title}</h1>
                <p className="mt-3 max-w-2xl text-base text-gray-600">{course.summary}</p>

                <div className="mt-6 grid gap-3 rounded-xl border border-gray-200 bg-[#fafafa] p-4 text-sm md:grid-cols-2">
                  <p><span className="font-semibold text-gray-900">Fecha y hora:</span> {formatDateTime(course.startAt)}</p>
                  <p><span className="font-semibold text-gray-900">Duracion:</span> {course.durationHours} horas</p>
                  <p><span className="font-semibold text-gray-900">Ciudad:</span> {course.city}</p>
                  <p><span className="font-semibold text-gray-900">Sede:</span> {course.venue}</p>
                  <p><span className="font-semibold text-gray-900">Cupos vendidos:</span> {course.soldSeats}</p>
                  <p><span className="font-semibold text-gray-900">Vacantes restantes:</span> {seatsLeft}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <aside className="border-t border-dashed border-gray-200 bg-[#fcfcff] p-5 lg:border-l lg:border-t-0 lg:p-7">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Entrada general</p>
                <p className="mt-1 text-4xl font-black text-[#111827]">S/ {course.price.toFixed(2)}</p>
                {typeof course.oldPrice === "number" ? (
                  <p className="mt-1 text-lg text-gray-400 line-through">S/ {course.oldPrice.toFixed(2)}</p>
                ) : null}
                <p className="mt-3 text-sm text-gray-600">
                  Vista de trabajo para pruebas internas.
                </p>

                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#25d366] px-4 text-sm font-bold text-white hover:brightness-95"
                >
                  Probar reserva por WhatsApp
                </a>
                <Link
                  href="/suscripcion"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#111827] px-4 text-sm font-bold text-[#111827] hover:bg-[#111827] hover:text-white"
                >
                  Ver plan mensual
                </Link>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = String(ctx.params?.id || "").trim();
  const course = id ? findCourseById(id) || null : null;
  return { props: { course } };
};

