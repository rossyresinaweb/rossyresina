import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }
    if (password !== confirm) {
      setError("Las contrasenas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo registrar");
        return;
      }
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-gray-100 to-transparent">
      <Head>
        <title>Crear cuenta — Rossy Resina</title>
      </Head>
      <div className="w-full max-w-md bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-1 shadow-md ring-2 ring-white/60">
            <Image src={require("@/images/logo.jpg")} alt="Logo Rossy Resina" width={64} height={64} className="rounded-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-amazon_blue">Crear cuenta</h1>
          <p className="mt-2 text-sm text-gray-600 text-center">Registra tu cuenta para guardar favoritos y comprar mas rapido.</p>
        </div>

        <div className="mt-6 grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasena"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmar contrasena"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            onClick={handleSubmit}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <span>Ya tienes cuenta?</span> <Link href="/sign-in" className="text-amazon_blue hover:underline">Inicia sesion</Link>
        </div>
      </div>
    </div>
  );
}
