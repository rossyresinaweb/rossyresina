import bcrypt from "bcryptjs";
import prisma from "./prisma";

export type UserRole = "ADMIN" | "EDITOR" | "CUSTOMER";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string | Date;
}

export async function getUsers(): Promise<AppUser[]> {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const needle = email.trim().toLowerCase();
  return prisma.user.findUnique({ where: { email: needle } });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim() || "Usuario",
      email,
      passwordHash,
      role: input.role || "CUSTOMER",
    },
  });
  return user as AppUser;
}

export async function verifyUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? (user as AppUser) : null;
}

export function isAdminEmail(email?: string | null) {
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!email) return false;
  return allowed.includes(email.toLowerCase());
}

export async function ensureAdminFromEnv() {
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const adminPass = String(process.env.ADMIN_PASSWORD || "");
  if (allowed.length === 0 || !adminPass) return;
  const email = allowed[0];
  const existing = await findUserByEmail(email);
  if (existing) return;
  const passwordHash = await bcrypt.hash(adminPass, 10);
  await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });
}
