import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const dataPath = path.join(process.cwd(), "src", "data", "blog.json");

function readPosts() {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writePosts(items: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2), "utf-8");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(readPosts());
  }
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (req.method === "POST") {
    const posts = readPosts();
    const body = req.body || {};
    const id = body.id ?? Date.now();
    const item = { ...body, id };
    posts.push(item);
    writePosts(posts);
    return res.status(201).json(item);
  }

  if (req.method === "PUT") {
    const posts = readPosts();
    const body = req.body || {};
    const id = body.id;
    const idx = posts.findIndex((p: any) => p.id == id || p.slug === body.slug);
    if (idx === -1) return res.status(404).json({ error: "Entrada no encontrada" });
    posts[idx] = { ...posts[idx], ...body };
    writePosts(posts);
    return res.status(200).json(posts[idx]);
  }

  if (req.method === "DELETE") {
    const id = (req.query.id as string) || (req.body?.id as string);
    const posts = readPosts();
    const before = posts.length;
    const filtered = posts.filter((p: any) => String(p.id) !== String(id));
    if (filtered.length === before) return res.status(404).json({ error: "Entrada no encontrada" });
    writePosts(filtered);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}
