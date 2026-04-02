import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { readCustomers } from "@/lib/customerStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return res.status(401).json({ error: "No autorizado" });

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const q = String(req.query.q || "").trim().toLowerCase();
  const rows = await readCustomers();
  const filtered = q
    ? rows.filter((c) => {
        return (
          String(c.name || "").toLowerCase().includes(q) ||
          String(c.dni || "").toLowerCase().includes(q) ||
          String(c.phone || "").toLowerCase().includes(q) ||
          String(c.locationLine || "").toLowerCase().includes(q)
        );
      })
    : rows;

  const sorted = [...filtered].sort((a, b) => {
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });

  return res.status(200).json(sorted);
}
