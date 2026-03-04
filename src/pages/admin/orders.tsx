import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function AdminOrdersPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Head>
        <title>Admin — Pedidos</title>
      </Head>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <Link href="/admin" className="text-sm text-amazon_blue hover:underline">Volver</Link>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-600">
        Todavia no hay pedidos registrados. Cuando integremos el checkout, apareceran aqui.
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return { redirect: { destination: "/sign-in?callbackUrl=/admin/orders", permanent: false } };
  return { props: {} };
};
