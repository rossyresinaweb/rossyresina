import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const dataPath = path.join(process.cwd(), "src", "data", "products.json");

function readProducts() {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeProducts(products: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), "utf-8");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const products = readProducts();
    return res.status(200).json(products);
  }
  const isAdmin = async () => {
    const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
    return !!session && (session.user as any)?.role === "ADMIN";
  };
  if (req.method === "POST") {
    return isAdmin().then((ok) => {
      if (!ok) return res.status(401).json({ error: "No autorizado" });
      const products = readProducts();
      const body = req.body || {};
      const newId = body._id ?? Date.now();
      const product = { ...body, _id: newId };
      products.push(product);
      writeProducts(products);
      return res.status(201).json(product);
    });
  }
  if (req.method === "PUT") {
    return isAdmin().then((ok) => {
      if (!ok) return res.status(401).json({ error: "No autorizado" });
      const products = readProducts();
      const body = req.body || {};
      const id = body._id;
      const idx = products.findIndex((p: any) => p._id == id);
      if (idx === -1) return res.status(404).json({ error: "Producto no encontrado" });
      products[idx] = { ...products[idx], ...body };
      writeProducts(products);
      return res.status(200).json(products[idx]);
    });
  }
  if (req.method === "DELETE") {
    return isAdmin().then((ok) => {
      if (!ok) return res.status(401).json({ error: "No autorizado" });
      const products = readProducts();
      const id = (req.query._id as string) || (req.body?._id as string);
      const before = products.length;
      const filtered = products.filter((p: any) => String(p._id) !== String(id));
      if (filtered.length === before) return res.status(404).json({ error: "Producto no encontrado" });
      writeProducts(filtered);
      return res.status(204).end();
    });
  }
  return res.status(405).json({ error: "Método no permitido" });
}
