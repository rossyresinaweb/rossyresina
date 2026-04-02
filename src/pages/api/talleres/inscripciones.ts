import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { fechaId, nombre, email, telefono, notas } = req.body;
    if (!fechaId || !nombre?.trim() || !email?.trim() || !telefono?.trim()) {
      return res.status(400).json({ error: "fechaId, nombre, email y teléfono son requeridos" });
    }

    const cursoFecha = await prisma.cursoFecha.findUnique({
      where: { id: String(fechaId) },
      include: { curso: true, inscripciones: { select: { id: true } } },
    });

    if (!cursoFecha) return res.status(404).json({ error: "Fecha no encontrada" });
    if (cursoFecha.inscripciones.length >= cursoFecha.curso.cupoMax) {
      return res.status(409).json({ error: "Esta fecha ya está llena" });
    }

    const inscripcion = await prisma.tallerInscripcion.create({
      data: {
        fechaId: String(fechaId),
        nombre: String(nombre).trim(),
        email: String(email).trim().toLowerCase(),
        telefono: String(telefono).trim(),
        notas: String(notas || ""),
      },
    });
    return res.status(201).json(inscripcion);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
