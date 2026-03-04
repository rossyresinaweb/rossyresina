import Link from "next/link";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const links = [
  { href: "/admin", label: "Productos" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/users", label: "Usuarios" },
];

export default function AdminLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-slate-900 text-white flex flex-col px-4 py-6">
          <div className="text-lg font-semibold tracking-wide">Panel Admin</div>
          <div className="mt-2 text-xs text-slate-300">Rossy Resina</div>
          <div className="mt-6 flex-1 grid gap-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-2 rounded-md hover:bg-slate-800 text-sm">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="grid gap-2">
            <Link href="/" className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm">
              Ir a la tienda
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm text-left"
            >
              Cerrar sesion
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Administracion</p>
              <h1 className="text-lg font-semibold">Gestion de la tienda</h1>
            </div>
            <div className="text-sm text-slate-500">Acceso restringido</div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
