import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { videos } from "@/data/capacitaciones";
import { VideoCameraIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CapacitacionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const video = videos.find((v) => v.id === id);
  const related = videos.filter((v) => v.id !== id).slice(0, 8);

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Video no encontrado.</p>
          <Link href="/capacitaciones" className="text-amazon_blue font-semibold hover:underline">
            Volver a capacitaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{video.title} | Rossy Resina</title>
      </Head>

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-screen-xl px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">

            {/* Video principal */}
            <div>
              {/* Reproductor */}
              <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3">
                <VideoCameraIcon className="w-16 h-16 text-gray-500" />
                <p className="text-gray-400 text-sm font-semibold">Video en proceso</p>
              </div>

              {/* Info del video */}
              <div className="mt-4">
                <h1 className="text-lg font-bold text-gray-900">{video.title}</h1>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amazon_blue flex items-center justify-center text-white text-sm font-bold shrink-0">
                      RR
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Rossy Resina</p>
                      <p className="text-xs text-gray-500">Canal oficial</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{video.views} vistas</span>
                    <span>·</span>
                    <span>{video.date}</span>
                    <span>·</span>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                      {video.level}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                      {video.tag}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mt-4 rounded-xl bg-gray-100 p-4">
                  <p className="text-sm text-gray-700">{video.desc}</p>
                  <p className="mt-2 text-xs text-gray-500">Duración: {video.duration}</p>
                </div>
              </div>

              <div className="mt-4">
                <Link href="/capacitaciones" className="text-sm text-amazon_blue font-semibold hover:underline flex items-center gap-1">
                  <ArrowLeftIcon className="w-4 h-4" /> Volver a capacitaciones
                </Link>
              </div>
            </div>

            {/* Sidebar de videos relacionados */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-700">Videos relacionados</p>
              {related.map((v) => (
                <Link key={v.id} href={`/capacitaciones/${v.id}`} className="group flex gap-3">
                  <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-gray-800 flex flex-col items-center justify-center gap-1">
                    <VideoCameraIcon className="w-6 h-6 text-gray-500" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-semibold text-white">
                      {v.duration}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-amazon_blue">
                      {v.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Rossy Resina</p>
                    <p className="text-xs text-gray-500">{v.views} vistas · {v.date}</p>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
