import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";

const db = prisma as any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const all = String(req.query.all || "").trim() === "1";
    const items = await db.ofertaExpress.findMany({
      where: all ? {} : { activo: true },
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
    });
    return res.status(200).json(items);
  }

  const session = await getServerSession(req, res, authOptions as any);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "POST") {
    const { nombre, imagen, activo, orden } = req.body || {};
    if (!nombre || !imagen) return res.status(400).json({ error: "Nombre e imagen requeridos" });
    const item = await db.ofertaExpress.create({
      data: {
        nombre: String(nombre).trim(),
        imagen: String(imagen).trim(),
        activo: activo !== false,
        orden: Number(orden || 0),
      },
    });
    return res.status(201).json(item);
  }

  if (req.method === "PUT") {
    const { id, nombre, imagen, activo, orden } = req.body || {};
    if (!id) return res.status(400).json({ error: "ID requerido" });
    const item = await db.ofertaExpress.update({
      where: { id: String(id) },
      data: {
        nombre: String(nombre || "").trim(),
        imagen: String(imagen || "").trim(),
        activo: Boolean(activo),
        orden: Number(orden || 0),
      },
    });
    return res.status(200).json(item);
  }

  if (req.method === "DELETE") {
    const id = String(req.query.id || req.body?.id || "").trim();
    if (!id) return res.status(400).json({ error: "ID requerido" });
    await db.ofertaExpress.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Método no permitido" });
}
