import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { parseOrderMeta } from "@/lib/orderMeta";

const db = prisma as any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return res.status(401).json({ error: "No autorizado" });
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });

  try {
    const orders = await db.order.findMany({
      select: { createdAt: true, total: true, customerNotes: true },
      orderBy: { createdAt: "asc" },
    });

    const currentYear = new Date().getFullYear();
    const byYearMap = new Map<number, { year: number; totalOrders: number; finalizados: number; revenue: number }>();

    let totalOrders = 0;
    let totalFinalizados = 0;
    let totalRevenue = 0;
    let currentYearOrders = 0;

    for (const order of orders) {
      const createdAt = new Date(order.createdAt);
      const year = createdAt.getFullYear();
      const amount = Number(order.total || 0);
      const meta = parseOrderMeta(order.customerNotes);
      const workflowStatus = String(meta.workflowStatus || "").toLowerCase();
      const isFinalizado = workflowStatus === "finalizado";

      totalOrders += 1;
      totalRevenue += amount;
      if (year === currentYear) currentYearOrders += 1;
      if (isFinalizado) totalFinalizados += 1;

      const prev = byYearMap.get(year) || { year, totalOrders: 0, finalizados: 0, revenue: 0 };
      prev.totalOrders += 1;
      prev.revenue += amount;
      if (isFinalizado) prev.finalizados += 1;
      byYearMap.set(year, prev);
    }

    const byYear = Array.from(byYearMap.values()).sort((a, b) => b.year - a.year);

    return res.status(200).json({
      totalOrders,
      totalFinalizados,
      currentYear,
      currentYearOrders,
      totalRevenue,
      byYear,
    });
  } catch {
    return res.status(500).json({ error: "No se pudieron obtener estadísticas" });
  }
}
