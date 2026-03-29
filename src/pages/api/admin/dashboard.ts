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
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [allOrders, products, customers, recentOrders] = await Promise.all([
      db.order.findMany({
        select: { id: true, createdAt: true, total: true, customerNotes: true, customerName: true, customerEmail: true, status: true },
        orderBy: { createdAt: "desc" },
      }),
      db.product.findMany({ select: { id: true, stock: true, title: true, price: true, category: true } }),
      db.order.groupBy({ by: ["customerEmail"], _count: { id: true } }),
      db.order.findMany({
        select: { id: true, createdAt: true, total: true, customerName: true, customerNotes: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    // KPIs
    let todayOrders = 0, todayRevenue = 0;
    let monthOrders = 0, monthRevenue = 0;
    let lastMonthRevenue = 0;
    let totalRevenue = 0;
    const byMonthMap = new Map<string, number>();

    for (const o of allOrders) {
      const date = new Date(o.createdAt);
      const amount = Number(o.total || 0);
      const meta = parseOrderMeta(o.customerNotes);
      const status = String(meta.workflowStatus || o.status || "").toLowerCase();

      totalRevenue += amount;

      if (date >= startOfDay) { todayOrders++; todayRevenue += amount; }
      if (date >= startOfMonth) { monthOrders++; monthRevenue += amount; }
      if (date >= startOfLastMonth && date <= endOfLastMonth) lastMonthRevenue += amount;

      // ventas por mes (últimos 6 meses)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      byMonthMap.set(key, (byMonthMap.get(key) || 0) + amount);
    }

    // Gráfico últimos 6 meses
    const salesChart = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
      return { month: months[d.getMonth()], revenue: byMonthMap.get(key) || 0 };
    });

    // Productos con stock bajo (< 5)
    const lowStock = products
      .filter((p: any) => Number(p.stock || 0) < 5)
      .slice(0, 5)
      .map((p: any) => ({ id: p.id, title: p.title, stock: Number(p.stock || 0), price: Number(p.price || 0) }));

    // Pedidos pendientes
    const pendingOrders = allOrders.filter((o: any) => {
      const meta = parseOrderMeta(o.customerNotes);
      const s = String(meta.workflowStatus || o.status || "").toLowerCase();
      return s.includes("pendiente") || s === "pending";
    }).length;

    // Últimos pedidos formateados
    const latestOrders = recentOrders.map((o: any) => {
      const meta = parseOrderMeta(o.customerNotes);
      return {
        id: o.id,
        customerName: o.customerName,
        total: Number(o.total || 0),
        status: String(meta.workflowStatus || o.status || "Pendiente"),
        createdAt: o.createdAt,
      };
    });

    // Crecimiento mes vs mes anterior
    const growth = lastMonthRevenue > 0
      ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return res.status(200).json({
      kpis: {
        todayOrders,
        todayRevenue,
        monthOrders,
        monthRevenue,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: customers.length,
        pendingOrders,
        growth,
      },
      salesChart,
      lowStock,
      latestOrders,
    });
  } catch (e) {
    return res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
}
