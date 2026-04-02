import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - listar slots con conteo de inscripciones
  if (req.method === "GET") {
    const slots = await prisma.tallerSlot.findMany({
      orderBy: { fecha: "asc" },
      include: { inscripciones: { select: { id: true, nombre: true, email: true, telefono: true, notas: true, createdAt: true } } },
    });
    return res.status(200).json(slots);
  }

  // POST - crear slot (admin)
  if (req.method === "POST") {
    const { cursoNombre, cursoNivel, descripcion, modalidad, ciudad, sede, fecha, duracionHoras, precio, precioAnterior, cupoMax, notaAdmin } = req.body;
    if (!cursoNombre?.trim() || !fecha || !precio) {
      return res.status(400).json({ error: "cursoNombre, fecha y precio son requeridos" });
    }
    const slot = await prisma.tallerSlot.create({
      data: {
        cursoNombre: String(cursoNombre).trim(),
        cursoNivel: String(cursoNivel || "Basico"),
        descripcion: String(descripcion || ""),
        modalidad: String(modalidad || "Presencial"),
        ciudad: String(ciudad || ""),
        sede: String(sede || ""),
        fecha: new Date(fecha),
        duracionHoras: Number(duracionHoras || 2),
        precio: Number(precio),
        precioAnterior: precioAnterior ? Number(precioAnterior) : null,
        cupoMax: Number(cupoMax || 6),
        notaAdmin: String(notaAdmin || ""),
      },
    });
    return res.status(201).json(slot);
  }

  // PATCH - editar slot (admin)
  if (req.method === "PATCH") {
    const { id, cursoNombre, cursoNivel, descripcion, modalidad, ciudad, sede, fecha, duracionHoras, precio, precioAnterior, cupoMax, notaAdmin } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido" });
    const slot = await prisma.tallerSlot.update({
      where: { id: String(id) },
      data: {
        ...(cursoNombre && { cursoNombre: String(cursoNombre).trim() }),
        ...(cursoNivel && { cursoNivel: String(cursoNivel) }),
        ...(descripcion !== undefined && { descripcion: String(descripcion) }),
        ...(modalidad && { modalidad: String(modalidad) }),
        ...(ciudad !== undefined && { ciudad: String(ciudad) }),
        ...(sede !== undefined && { sede: String(sede) }),
        ...(fecha && { fecha: new Date(fecha) }),
        ...(duracionHoras && { duracionHoras: Number(duracionHoras) }),
        ...(precio !== undefined && { precio: Number(precio) }),
        precioAnterior: precioAnterior ? Number(precioAnterior) : null,
        ...(cupoMax && { cupoMax: Number(cupoMax) }),
        ...(notaAdmin !== undefined && { notaAdmin: String(notaAdmin) }),
      },
    });
    return res.status(200).json(slot);
  }

  // DELETE - eliminar slot (admin)
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID requerido" });
    await prisma.tallerSlot.delete({ where: { id: String(id) } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
