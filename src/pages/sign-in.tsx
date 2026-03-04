import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const cb = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/";
      router.replace(cb);
    }
  }, [session, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12 bg-gradient-to-b from-gray-100 to-transparent">
      <Head>
        <title>Iniciar sesión — Rossy Resina</title>
        <meta name="description" content="Accede a tu cuenta para guardar favoritos y realizar compras." />
      </Head>
      <div className="w-full max-w-md bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-full p-1 shadow-md ring-2 ring-white/60">
            <Image src={require("@/images/logo.jpg")} alt="Logo Rossy Resina" width={64} height={64} className="rounded-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-amazon_blue">Bienvenida/o a Rossy Resina</h1>
          <p className="mt-2 text-sm text-gray-600 text-center">Inicia sesión para continuar con tu compra y guardar tus favoritos.</p>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="grid gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={() => {
                setLoading(true);
                const cb = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/";
                signIn("credentials", { email, password, callbackUrl: cb }).finally(() => setLoading(false));
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
          <button
            onClick={() => signIn("google")}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.2 1.2 8.5 3.2l5.7-5.7C34.6 5.1 29.6 3 24 3 12.3 3 9.2 7.1 6.3 14.7z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.4 16.1 18.9 13 24 13c3.2 0 6.2 1.2 8.5 3.2l5.7-5.7C34.6 5.1 29.6 3 24 3 16.1 3 9.2 7.1 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.3l-6.2-5.1C29.2 36.5 26.7 37 24 37c-5.1 0-9.6-3.1-11.3-7.8l-6.6 5.1C9.9 40.9 16.4 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.4-3.5 6.2-6.6 8l6.2 5.1C38.4 39.7 41 34.6 41 29c0-2.4-.4-4.5-1.4-6.5z"/></svg>
            Continuar con Google
          </button>
          <button
            onClick={() => signIn("github")}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-brand_teal text-brand_teal hover:bg-brand_teal hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.78-1.34-1.78-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.02-.33 3.35 1.23a11.6 11.6 0 0 1 6.1 0c2.33-1.56 3.35-1.23 3.35-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.9 1.24 3.22 0 4.61-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.21v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z"/></svg>
            Continuar con GitHub
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Al continuar aceptas nuestros <Link href="/terms" className="text-amazon_blue hover:underline">términos</Link> y <Link href="/privacy" className="text-amazon_blue hover:underline">privacidad</Link>.
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <span>¿No tienes cuenta?</span>{" "}
          <Link href="/register" className="text-amazon_blue hover:underline">Regístrate</Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
            Volver al inicio
          </Link>
        </div>

        {session && (
          <div className="mt-6 text-center">
            <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-amazon_blue">Cerrar sesión</button>
          </div>
        )}
      </div>
    </div>
  );
}
