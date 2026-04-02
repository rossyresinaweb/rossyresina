import type { NextApiRequest, NextApiResponse } from "next";
import { readCustomers } from "@/lib/customerStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "M?todo no permitido" });
  }

  const query = String(req.query.query || "").trim();
  if (query.length < 3) {
    return res.status(400).json({ error: "Ingresa al menos 3 caracteres" });
  }

  try {
    const q = query.toLowerCase();
    const rows = await readCustomers();
    const best =
      rows.find((c) => String(c.dni || "") === query) ||
      rows.find((c) => String(c.name || "").toLowerCase() === q) ||
      rows.find((c) => String(c.name || "").toLowerCase().includes(q));

    if (!best) return res.status(200).json({ found: false });

    return res.status(200).json({
      found: true,
      profile: {
        name: best.name,
        dni: best.dni,
        phone: best.phone,
        locationLine: best.locationLine,
        shippingCarrier: best.shippingCarrier,
        shalomAgency: best.shalomAgency,
        olvaAddress: best.olvaAddress,
        olvaReference: best.olvaReference,
      },
    });
  } catch {
    return res.status(500).json({ error: "No se pudo buscar cliente recurrente" });
  }
}
