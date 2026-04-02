import prisma from "./prisma";
import type { ShippingCarrier } from "./orderMeta";

export type CustomerRecord = {
  dni: string;
  name: string;
  phone: string;
  locationLine: string;
  shippingCarrier: ShippingCarrier;
  shalomAgency: string;
  olvaAddress: string;
  olvaReference: string;
  createdAt: string;
  updatedAt: string;
};

const db = prisma as any;

export async function readCustomers(): Promise<CustomerRecord[]> {
  const rows = await db.customerProfile.findMany({ orderBy: { updatedAt: "desc" } });
  return rows.map((r: any) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function upsertCustomer(record: Omit<CustomerRecord, "createdAt" | "updatedAt">) {
  const dni = String(record.dni || "").trim();
  if (!dni) return;
  await db.customerProfile.upsert({
    where: { dni },
    update: { ...record, dni },
    create: { ...record, dni },
  });
}
