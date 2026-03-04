import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || (session.user as any)?.role !== "ADMIN") return res.status(401).json({ error: "No autorizado" });
  const { filename, data } = (req.body || {}) as any;
  if (!data || typeof data !== "string") return res.status(400).json({ error: "Datos inválidos" });

  const match = data.match(/^data:(image\/(png|jpe?g|webp));base64,(.+)$/i);
  if (!match) return res.status(400).json({ error: "Formato de imagen inválido" });
  const ext = match[2].toLowerCase() === "jpeg" ? "jpg" : match[2].toLowerCase();
  const base64 = match[3];
  const buf = Buffer.from(base64, "base64");
  if (buf.length > 5 * 1024 * 1024) return res.status(413).json({ error: "Imagen muy grande" });

  const safeName = String(filename || `img_${Date.now()}.${ext}`)
    .replace(/[^a-zA-Z0-9_\-.]/g, "_");
  const dir = path.join(process.cwd(), "public", "products");
  ensureDir(dir);
  const filePath = path.join(dir, safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`);
  fs.writeFileSync(filePath, buf);
  const url = `/products/${path.basename(filePath)}`;
  return res.status(201).json({ url });
}
