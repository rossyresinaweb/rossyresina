import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const dataPath = path.join(process.cwd(), "src", "data", "categories.json");

function readCategories() {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCategories(items: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2), "utf-8");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const items = readCategories();
    return res.status(200).json(items);
  }
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || (session.user as any)?.role !== "ADMIN") return res.status(401).json({ error: "No autorizado" });

  if (req.method === "POST") {
    const items = readCategories();
    const body = req.body || {};
    const id = body._id ?? Date.now();
    const item = { ...body, _id: id };
    items.push(item);
    writeCategories(items);
    return res.status(201).json(item);
  }
  if (req.method === "PUT") {
    const items = readCategories();
    const body = req.body || {};
    const id = body._id;
    const idx = items.findIndex((c: any) => c._id == id);
    if (idx === -1) return res.status(404).json({ error: "Categoría no encontrada" });
    items[idx] = { ...items[idx], ...body };
    writeCategories(items);
    return res.status(200).json(items[idx]);
  }
  if (req.method === "DELETE") {
    const items = readCategories();
    const id = (req.query._id as string) || (req.body?._id as string);
    const before = items.length;
    const filtered = items.filter((c: any) => String(c._id) !== String(id));
    if (filtered.length === before) return res.status(404).json({ error: "Categoría no encontrada" });
    writeCategories(filtered);
    return res.status(204).end();
  }
  return res.status(405).json({ error: "Método no permitido" });
}
