import prisma from "./prisma";

export type NewsletterSubscriber = {
  email: string;
  createdAt: string;
};

export async function addNewsletterSubscriber(emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email) return { ok: false as const, reason: "EMAIL_REQUIRED" as const };

  const existing = await (prisma as any).newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return { ok: true as const, status: "exists" as const };

  await (prisma as any).newsletterSubscriber.create({ data: { email } });
  return { ok: true as const, status: "created" as const };
}
