import Link from "next/link";

export default function AdminNav() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
      <Link href="/admin" className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Productos</Link>
      <Link href="/admin/categories" className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Categorias</Link>
      <Link href="/admin/blog" className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Blog</Link>
      <Link href="/admin/orders" className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Pedidos</Link>
      <Link href="/admin/users" className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Usuarios</Link>
    </div>
  );
}
