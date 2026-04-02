import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // GET - listar inscripciones (solo admin)
  if (req.method === "GET") {
    try {
      const rows = await (prisma as any).capacitacionInscripcion.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(rows);
    } catch {
      return res.status(500).json({ error: "Error al obtener inscripciones" });
    }
  }

  // POST - nueva inscripción pública
  if (req.method === "POST") {
    const { nombre, email, telefono, curso, nivel, mensaje } = req.body;
    if (!nombre?.trim() || !email?.trim() || !curso?.trim()) {
      return res.status(400).json({ error: "Nombre, email y curso son requeridos" });
    }
    try {
      const row = await (prisma as any).capacitacionInscripcion.create({
        data: {
          nombre: String(nombre).trim(),
          email: String(email).trim().toLowerCase(),
          telefono: String(telefono || "").trim(),
          curso: String(curso).trim(),
          nivel: String(nivel || "Basico").trim(),
          mensaje: String(mensaje || "").trim(),
          estado: "PENDIENTE",
        },
      });
      return res.status(201).json(row);
    } catch {
      return res.status(500).json({ error: "Error al guardar inscripción" });
    }
  }

  // PATCH - actualizar estado o fecha (admin)
  if (req.method === "PATCH") {
    const { id, estado, fechaProgramada, notaAdmin } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido" });
    try {
      const row = await (prisma as any).capacitacionInscripcion.update({
        where: { id: String(id) },
        data: {
          ...(estado && { estado: String(estado) }),
          ...(fechaProgramada && { fechaProgramada: new Date(fechaProgramada) }),
          ...(notaAdmin !== undefined && { notaAdmin: String(notaAdmin) }),
        },
      });
      return res.status(200).json(row);
    } catch {
      return res.status(500).json({ error: "Error al actualizar inscripción" });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID requerido" });
    try {
      await (prisma as any).capacitacionInscripcion.delete({ where: { id: String(id) } });
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Error al eliminar" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
