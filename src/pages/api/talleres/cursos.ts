import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const cursos = await prisma.curso.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fechas: {
          orderBy: { fecha: "asc" },
          include: { inscripciones: { select: { id: true, nombre: true, email: true, telefono: true, notas: true, createdAt: true } } },
        },
      },
    });
    return res.status(200).json(cursos);
  }

  if (req.method === "POST") {
    try {
      const { nombre, nivel, descripcion, modalidad, ciudad, sede, duracionHoras, precio, precioAnterior, cupoMax, imagen, notaAdmin, fechas } = req.body;
      if (!nombre?.trim() || precio === undefined || precio === null || !fechas?.length) {
        return res.status(400).json({ error: "nombre, precio y al menos una fecha son requeridos" });
      }
      const curso = await prisma.curso.create({
        data: {
          nombre: String(nombre).trim(),
          nivel: String(nivel || "Basico"),
          descripcion: String(descripcion || ""),
          modalidad: String(modalidad || "Presencial"),
          ciudad: String(ciudad || ""),
          sede: String(sede || ""),
          duracionHoras: Number(duracionHoras || 2),
          precio: Number(precio),
          precioAnterior: precioAnterior ? Number(precioAnterior) : null,
          cupoMax: Number(cupoMax || 6),
          imagen: String(imagen || ""),
          notaAdmin: String(notaAdmin || ""),
          fechas: { create: (fechas as string[]).map((f) => ({ fecha: new Date(f) })) },
        },
        include: { fechas: { include: { inscripciones: true } } },
      });
      return res.status(201).json(curso);
    } catch (e: any) {
      console.error("[POST /api/talleres/cursos]", e);
      return res.status(500).json({ error: e?.message || "Error interno" });
    }
  }

  if (req.method === "PATCH") {
    const { id, nombre, nivel, descripcion, modalidad, ciudad, sede, duracionHoras, precio, precioAnterior, cupoMax, imagen, notaAdmin, fechasAdd, fechasRemove } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido" });

    const curso = await prisma.curso.update({
      where: { id: String(id) },
      data: {
        ...(nombre && { nombre: String(nombre).trim() }),
        ...(nivel && { nivel: String(nivel) }),
        ...(descripcion !== undefined && { descripcion: String(descripcion) }),
        ...(modalidad && { modalidad: String(modalidad) }),
        ...(ciudad !== undefined && { ciudad: String(ciudad) }),
        ...(sede !== undefined && { sede: String(sede) }),
        ...(duracionHoras && { duracionHoras: Number(duracionHoras) }),
        ...(precio !== undefined && { precio: Number(precio) }),
        precioAnterior: precioAnterior ? Number(precioAnterior) : null,
        ...(cupoMax && { cupoMax: Number(cupoMax) }),
        ...(imagen !== undefined && { imagen: String(imagen) }),
        ...(notaAdmin !== undefined && { notaAdmin: String(notaAdmin) }),
        ...(fechasAdd?.length && { fechas: { create: (fechasAdd as string[]).map((f) => ({ fecha: new Date(f) })) } }),
      },
      include: { fechas: { orderBy: { fecha: "asc" }, include: { inscripciones: true } } },
    });

    if (fechasRemove?.length) {
      await prisma.cursoFecha.deleteMany({ where: { id: { in: fechasRemove as string[] } } });
    }

    return res.status(200).json(curso);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID requerido" });
    await prisma.curso.delete({ where: { id: String(id) } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
