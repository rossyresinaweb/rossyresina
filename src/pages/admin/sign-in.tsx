import Head from "next/head";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { EyeIcon, EyeSlashIcon, LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function AdminSignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) {
      const cb = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/admin";
      router.replace(cb);
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const cb = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/admin";
    try {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: cb });
      if (res?.ok) {
        const sessionRes = await fetch("/api/auth/session");
        const sessionJson = await sessionRes.json();
        if (sessionJson?.user?.role === "ADMIN") {
          router.replace(res.url || cb);
          return;
        }
        setErrorMsg("Tu usuario no tiene permisos de administrador.");
      } else {
        setErrorMsg("Credenciales inválidas. Verifica tu email y contraseña.");
      }
    } catch {
      setErrorMsg("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Acceso Admin · Rossy Resina</title>
      </Head>
      <div className="min-h-screen bg-[#0f1117] flex">

        {/* Panel izquierdo decorativo */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] border-r border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amazon_blue flex items-center justify-center text-white font-black text-sm">
              RR
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Rossy Resina</p>
              <p className="text-white/30 text-xs tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Gestiona tu tienda<br />
              <span className="text-amazon_blue">con total control.</span>
            </h2>
            <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-sm">
              Panel de administración centralizado para productos, pedidos, capacitaciones, analítica y más.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { label: "Productos", value: "Gestión completa" },
                { label: "Pedidos", value: "Tiempo real" },
                { label: "Analítica", value: "Visitas y ventas" },
                { label: "Capacitaciones", value: "Videos y cursos" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/5 bg-white/3 p-4">
                  <p className="text-xs text-white/30 uppercase tracking-wide">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-xs">© {new Date().getFullYear()} Rossy Resina. Acceso restringido.</p>
        </div>

        {/* Panel derecho - formulario */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="h-10 w-10 rounded-xl bg-amazon_blue flex items-center justify-center text-white font-black text-sm">RR</div>
              <p className="text-white font-bold text-lg">Rossy Resina Admin</p>
            </div>

            <h1 className="text-2xl font-black text-white">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-white/40">Ingresa tus credenciales de administrador</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Correo electrónico</label>
                <div className="relative mt-2">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@rossyresina.com"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-amazon_blue focus:bg-white/8 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Contraseña</label>
                <div className="relative mt-2">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-amazon_blue transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-amazon_blue text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verificando...
                  </span>
                ) : "Ingresar al panel"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-white/20">
              Acceso restringido · Solo personal autorizado
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
