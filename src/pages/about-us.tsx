import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function AboutUsPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Rossy Resina — Sobre nosotros</title>
        <meta name="description" content="Conoce la historia, misión y valores de Rossy Resina. Calidad en resina epoxi, moldes, pigmentos y asesoría." />
      </Head>

      <header className="rounded-lg bg-amazon_blue text-white p-6 shadow">
        <h1 className="text-2xl md:text-3xl font-semibold">Somos Rossy Resina</h1>
        <p className="mt-2 text-sm md:text-base opacity-95">Pasión por la resina epoxi y UV, asesoría cercana y productos de calidad para que tus proyectos brillen.</p>
        <div className="mt-4 flex items-center gap-3">
          <Link href="/contact" className="inline-block px-4 py-2 rounded bg-white text-amazon_blue hover:bg-amazon_yellow hover:text-black font-semibold text-sm">Contáctanos</Link>
          <Link href="/categoria/resina" className="inline-block px-4 py-2 rounded bg-white/20 backdrop-blur hover:bg-white/30 text-white font-semibold text-sm">Ver resinas</Link>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-6 bg-white shadow border border-gray-200">
          <p className="text-lg font-semibold">Calidad comprobada</p>
          <p className="text-sm text-gray-700 mt-1">Seleccionamos resinas, moldes y pigmentos que garantizan resultados profesionales.</p>
        </div>
        <div className="rounded-lg p-6 bg-white shadow border border-gray-200">
          <p className="text-lg font-semibold">Asesoría cercana</p>
          <p className="text-sm text-gray-700 mt-1">Te ayudamos a elegir materiales y técnicas según tu proyecto.</p>
        </div>
        <div className="rounded-lg p-6 bg-white shadow border border-gray-200">
          <p className="text-lg font-semibold">Aprendizaje constante</p>
          <p className="text-sm text-gray-700 mt-1">Descubre talleres y consejos para perfeccionar tus creaciones en resina.</p>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg p-6 bg-white shadow border border-gray-200">
          <h2 className="text-xl font-semibold">Nuestra historia</h2>
          <div className="mt-2 text-sm text-gray-700 grid gap-3">
            <p>Comenzamos como amantes del arte en resina, buscando materiales confiables y técnicas claras. Esa búsqueda nos llevó a crear una tienda enfocada en ayudarte a lograr piezas duraderas y estéticas.</p>
            <p>Hoy ofrecemos resinas epoxi y UV, moldes de silicona, pigmentos y accesorios, además de talleres para principiantes y avanzados.</p>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/categoria/resina" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Resinas epoxi y UV</Link>
            <Link href="/categoria/moldes-de-silicona" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Moldes de silicona</Link>
            <Link href="/categoria/pigmentos" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Pigmentos y glitter</Link>
            <Link href="/categoria/accesorios" className="rounded-lg p-4 bg-amazon_blue text-white shadow hover:bg-amazon_yellow hover:text-black">Accesorios</Link>
          </div>
        </div>
        <aside className="rounded-lg p-6 bg-white shadow border border-gray-200">
          <h3 className="text-lg font-semibold">Compromisos</h3>
          <ul className="mt-2 grid gap-2 text-sm text-gray-700">
            <li>• Entrega rápida y soporte por WhatsApp.</li>
            <li>• Materiales probados y fichas técnicas claras.</li>
            <li>• Consejos para evitar burbujas y mejorar acabados.</li>
          </ul>
          <div className="mt-4 text-sm">
            <a href="https://wa.me/51966357648" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Escríbenos por WhatsApp</a>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-6 bg-white shadow border border-gray-200">
          <p className="text-lg font-semibold">Talleres</p>
          <p className="text-sm text-gray-700 mt-1">Aprende resina desde cero o perfecciona técnicas avanzadas.</p>
          <Link href="/categoria/talleres" className="mt-3 inline-block px-4 py-2 rounded bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black text-sm">Ver talleres</Link>
        </div>
        <div className="rounded-lg p-6 bg-white shadow border border-gray-200">
          <p className="text-lg font-semibold">Blog</p>
          <p className="text-sm text-gray-700 mt-1">Tips, novedades y proyectos inspiradores.</p>
          <Link href="/blog" className="mt-3 inline-block px-4 py-2 rounded bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black text-sm">Explorar blog</Link>
        </div>
        <div className="rounded-lg p-6 bg-white shadow border border-gray-200">
          <p className="text-lg font-semibold">Contacto</p>
          <p className="text-sm text-gray-700 mt-1">¿Dudas? Estamos para ayudarte.</p>
          <Link href="/contact" className="mt-3 inline-block px-4 py-2 rounded bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black text-sm">Ir a contacto</Link>
        </div>
      </section>
    </div>
  );
}
