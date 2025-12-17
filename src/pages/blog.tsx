import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";

type Post = {
  slug: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  excerpt: string;
  image?: string;
};

interface Props { posts: Post[] }

export default function BlogPage({ posts }: Props) {
  const categories = [
    { href: "/categoria/resina", label: "Resina" },
    { href: "/categoria/moldes-de-silicona", label: "Moldes de silicona" },
    { href: "/categoria/pigmentos", label: "Pigmentos" },
    { href: "/categoria/accesorios", label: "Accesorios" },
    { href: "/categoria/creaciones", label: "Creaciones" },
    { href: "/categoria/talleres", label: "Talleres" },
  ];
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Rossy Resina — Blog</title>
      </Head>
      <div className="mb-6">
        <ul className="text-sm text-gray-600 flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">Inicio</Link>
          </li>
          <li>/</li>
          <li className="text-gray-800">Blog</li>
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid gap-6">
          {posts.map((p) => (
            <article key={p.slug} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {p.image ? (
                <div className="relative h-40">
                  <Image src={((): string => { const s = String(p.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()} alt={p.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-200/60 to-transparent" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-r from-brand_purple via-brand_pink to-brand_teal" />
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold text-amazon_blue">
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                <div className="mt-1 text-sm text-gray-600 flex items-center gap-3">
                  <span>{p.author}</span>
                  <span>·</span>
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.comments} comentarios</span>
                </div>
                <p className="mt-3 text-gray-700">{p.excerpt}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Link href={`/blog/${p.slug}`} className="px-3 py-2 rounded-md bg-gradient-to-r from-brand_purple via-brand_pink to-brand_teal text-white hover:brightness-105">Leer más</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="grid gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold">Categorías</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {categories.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="px-2 py-1 rounded hover:bg-gray-100 inline-block">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold">Entradas populares</h3>
            <ul className="mt-3 grid gap-3 text-sm">
              {posts.slice(0, 2).map((p) => (
                <li key={`pop-${p.slug}`} className="border-b border-gray-200 pb-2">
                  <Link href={`/blog/${p.slug}`} className="font-medium text-amazon_blue hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-gray-600 mt-1">{p.date}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "blog.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const posts = JSON.parse(raw);
    return { props: { posts } };
  } catch (e) {
    return { props: { posts: [] } };
  }
};
