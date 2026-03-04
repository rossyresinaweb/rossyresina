import type { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "@/lib/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }
  const { name, email, password } = req.body || {};
  const emailClean = String(email || "").trim().toLowerCase();
  const pass = String(password || "");
  if (!emailClean || !pass) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  if (pass.length < 6) {
    return res.status(400).json({ error: "La contrasena debe tener al menos 6 caracteres" });
  }
  try {
    const user = await createUser({
      name: String(name || "Usuario"),
      email: emailClean,
      password: pass,
      role: "CUSTOMER",
    });
    return res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (e: any) {
    if (e?.message === "EMAIL_EXISTS") {
      return res.status(409).json({ error: "El correo ya esta registrado" });
    }
    return res.status(500).json({ error: "No se pudo registrar" });
  }
}
