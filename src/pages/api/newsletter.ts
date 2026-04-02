import type { NextApiRequest, NextApiResponse } from "next";
import { addNewsletterSubscriber } from "@/lib/newsletter";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendConfirmationEmail(to: string) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Rossy Resina";

  if (!apiKey || !from) {
    return { sent: false as const, reason: "EMAIL_PROVIDER_NOT_CONFIGURED" as const };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5; color:#111;">
      <h2>Suscripci?n confirmada</h2>
      <p>Hola,</p>
      <p>Tu correo fue suscrito correctamente a las novedades de <strong>${brand}</strong>.</p>
      <p>Gracias por suscribirte.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Suscripci?n confirmada",
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`RESEND_SEND_FAILED:${response.status}:${details}`);
  }

  return { sent: true as const };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "M?todo no permitido" });
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Correo requerido" });
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Correo invalido" });

    const result = await addNewsletterSubscriber(email);
    if (!result.ok) return res.status(400).json({ error: "No se pudo suscribir" });

    const mailResult = await sendConfirmationEmail(email);

    return res.status(200).json({
      ok: true,
      status: result.status,
      emailSent: mailResult.sent,
      message: mailResult.sent
        ? "Suscripci?n completada. Revisa tu correo."
        : "Suscripci?n guardada. Configura RESEND_API_KEY y RESEND_FROM_EMAIL para enviar confirmaciones.",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Error al procesar la suscripci?n",
      detail: String(error?.message || ""),
    });
  }
}
