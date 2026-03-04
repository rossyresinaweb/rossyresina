import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

interface Category {
  _id: number;
  name: string;
  slug: string;
}

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    setName("");
    setSlug("");
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/categories?_id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin — Categorías</title>
      </Head>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <Link href="/admin" className="text-sm text-amazon_blue hover:underline">Volver</Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Crear categoría</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (ej: moldes-de-silicona)" className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <button onClick={create} className="mt-3 px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Crear</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Listado</h2>
        <div className="grid gap-3">
          {items.map((c) => (
            <div key={c._id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">{c.slug}</div>
              </div>
              <button onClick={() => remove(c._id)} className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:opacity-90">Eliminar</button>
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
  if (!ok) return { redirect: { destination: "/sign-in?callbackUrl=/admin/categories", permanent: false } };
  return { props: {} };
};
