import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

const isAdmin = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions as any);
  return !!session && (session.user as any)?.role === "ADMIN";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAdmin(req, res))) return res.status(401).json({ error: "No autorizado" });

  // GET /api/products/variants?productId=xxx
  if (req.method === "GET") {
    const productId = String(req.query.productId || "").trim();
    if (!productId) return res.status(400).json({ error: "productId requerido" });
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json(variants.map((v) => ({
      id: v.id,
      label: v.label,
      price: Number(v.price),
      oldPrice: v.oldPrice != null ? Number(v.oldPrice) : null,
      stock: v.stock,
    })));
  }

  // POST — crear variante
  if (req.method === "POST") {
    const { productId, label, price, oldPrice, stock } = req.body;
    if (!productId || !label?.trim() || price === undefined) {
      return res.status(400).json({ error: "productId, label y price son requeridos" });
    }
    const variant = await prisma.productVariant.create({
      data: {
        productId: String(productId),
        label: String(label).trim(),
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        stock: Number(stock || 0),
      },
    });
    return res.status(201).json({ ...variant, price: Number(variant.price), oldPrice: variant.oldPrice != null ? Number(variant.oldPrice) : null });
  }

  // PUT — editar variante
  if (req.method === "PUT") {
    const { id, label, price, oldPrice, stock } = req.body;
    if (!id) return res.status(400).json({ error: "id requerido" });
    const variant = await prisma.productVariant.update({
      where: { id: String(id) },
      data: {
        ...(label && { label: String(label).trim() }),
        ...(price !== undefined && { price: Number(price) }),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        ...(stock !== undefined && { stock: Number(stock) }),
      },
    });
    return res.status(200).json({ ...variant, price: Number(variant.price), oldPrice: variant.oldPrice != null ? Number(variant.oldPrice) : null });
  }

  // DELETE — eliminar variante
  if (req.method === "DELETE") {
    const id = String(req.query.id || "").trim();
    if (!id) return res.status(400).json({ error: "id requerido" });
    await prisma.productVariant.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
