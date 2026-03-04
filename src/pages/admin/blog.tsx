import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

interface Post {
  id: number;
  slug: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  excerpt: string;
  content: string[];
  image?: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("Rossy Resina");
  const [date, setDate] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  const load = async () => {
    const res = await fetch("/api/blog");
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        author,
        date: date || new Date().toLocaleDateString(),
        comments: 0,
        excerpt,
        image,
        content: content.split(/\r?\n/).filter(Boolean),
      }),
    });
    setTitle("");
    setSlug("");
    setExcerpt("");
    setImage("");
    setContent("");
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin — Blog</title>
      </Head>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Link href="/admin" className="text-sm text-amazon_blue hover:underline">Volver</Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Crear entrada</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (ej: resina-epoxi)" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autor" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Fecha" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="URL de imagen" className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-2" />
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Extracto" className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-2" rows={2} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenido (una linea por parrafo)" className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-2" rows={5} />
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Publicar</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Entradas</h2>
        <div className="grid gap-3">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-600">{p.slug}</div>
              </div>
              <button onClick={() => remove(p.id)} className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:opacity-90">Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/sign-in?callbackUrl=/admin/blog", permanent: false } };
  return { props: {} };
};
