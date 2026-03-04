import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "CUSTOMER";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRow["role"]>("CUSTOMER");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo crear");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setRole("CUSTOMER");
    load();
  };

  const updateRole = async (id: string, nextRole: UserRow["role"]) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: nextRole }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin — Usuarios</title>
      </Head>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <Link href="/admin" className="text-sm text-amazon_blue hover:underline">Volver</Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Crear usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value as UserRow["role"])} className="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
            <option value="CUSTOMER">Cliente</option>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        <button onClick={create} className="mt-3 px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">Crear</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Lista de usuarios</h2>
        {loading ? (
          <div className="text-sm text-gray-600">Cargando...</div>
        ) : (
          <div className="grid gap-3">
            {users.map((u) => (
              <div key={u.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-200 rounded-lg p-3">
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value as UserRow["role"])} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                    <option value="CUSTOMER">Cliente</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button onClick={() => remove(u.id)} className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:opacity-90">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/sign-in?callbackUrl=/admin/users", permanent: false } };
  return { props: {} };
};
