import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";

const db = prisma as any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const posts = await db.blogPost.findMany({ orderBy: { date: "desc" } });
    return res.status(200).json(posts);
  }

  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const slug = String(body.slug || "").trim() || String(body.title || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const post = await db.blogPost.create({
      data: {
        slug,
        title: String(body.title || "").trim(),
        author: String(body.author || "Rossy").trim(),
        date: String(body.date || new Date().toISOString().slice(0, 10)),
        excerpt: String(body.excerpt || "").trim(),
        content: Array.isArray(body.content) ? body.content : [],
        image: String(body.image || "").trim(),
        comments: Number(body.comments || 0),
      },
    });
    return res.status(201).json(post);
  }

  if (req.method === "PUT") {
    const body = req.body || {};
    const id = String(body.id || "").trim();
    if (!id) return res.status(400).json({ error: "ID requerido" });
    const post = await db.blogPost.update({
      where: { id },
      data: {
        slug: String(body.slug || "").trim(),
        title: String(body.title || "").trim(),
        author: String(body.author || "Rossy").trim(),
        date: String(body.date || ""),
        excerpt: String(body.excerpt || "").trim(),
        content: Array.isArray(body.content) ? body.content : [],
        image: String(body.image || "").trim(),
        comments: Number(body.comments || 0),
      },
    });
    return res.status(200).json(post);
  }

  if (req.method === "DELETE") {
    const id = String((req.query.id as string) || req.body?.id || "").trim();
    if (!id) return res.status(400).json({ error: "ID requerido" });
    await db.blogPost.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Método no permitido" });
}
