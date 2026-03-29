import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
    const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { filename, data } = (req.body || {}) as any;
    if (!data || typeof data !== "string") return res.status(400).json({ error: "Datos invalidos" });

    const match = data.match(/^data:(image\/(png|jpe?g|webp|avif));base64,(.+)$/i);
    if (!match) return res.status(400).json({ error: "Formato de imagen invalido" });

    const ext = match[2].toLowerCase() === "jpeg" ? "jpg" : match[2].toLowerCase();
    const base64 = match[3];
    const buf = Buffer.from(base64, "base64");
    if (buf.length > 5 * 1024 * 1024) return res.status(413).json({ error: "Imagen muy grande" });

    const safeName = String(filename || `img_${Date.now()}.${ext}`).replace(/[^a-zA-Z0-9_\-.]/g, "_");
    const nameWithoutExt = safeName.replace(/\.[a-z0-9]+$/i, "");
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const finalPublicId = `${nameWithoutExt}_${uniqueSuffix}`;
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Cloudinary no esta configurado en variables de entorno" });
    }

    const upload = await cloudinary.uploader.upload(data, {
      folder: "products",
      resource_type: "image",
      public_id: finalPublicId,
      overwrite: false,
    });

    const url = String(upload.secure_url || "").trim();
    if (!url) return res.status(500).json({ error: "Cloudinary no devolvio URL segura" });
    return res.status(201).json({ url });
  } catch (error: any) {
    const msg = String(error?.message || "No se pudo subir la imagen");
    return res.status(500).json({ error: msg });
  }
}
