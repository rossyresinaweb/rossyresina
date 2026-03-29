import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import {
  encodeOrderMeta,
  parseOrderMeta,
  paymentMethodLabel,
  shippingCarrierLabel,
} from "@/lib/orderMeta";

type DbOrderStatus = "PENDING" | "PAID" | "SHIPPED";
const db = prisma as any;

const toDbStatus = (status: string): DbOrderStatus | null => {
  const s = status.trim().toLowerCase();
  if (!s) return null;
  if (s === "pending" || s === "pendiente por confirmar") return "PENDING";
  if (s === "paid" || s === "confirmado") return "PAID";
  if (s === "shipped" || s === "en proceso de envío" || s === "enviado" || s === "finalizado") {
    return "SHIPPED";
  }
  return null;
};

const toLegacyStatus = (status: DbOrderStatus): string => {
  if (status === "PAID") return "Confirmado";
  if (status === "SHIPPED") return "Enviado";
  return "Pendiente por confirmar";
};

const toYYYYMMDD = (value: Date): string => {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
};

const buildOrderCode = (createdAt: Date, id: string): string => {
  const datePart = toYYYYMMDD(createdAt);
  const suffix = String(id || "").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "000000";
  return `RR-${datePart}-${suffix}`;
};

const serializeOrder = (order: any) => {
  const meta = parseOrderMeta(order.customerNotes);
  const orderCode = meta.orderCode || buildOrderCode(new Date(order.createdAt), String(order.id || ""));
  const statusText = meta.workflowStatus || toLegacyStatus(order.status as DbOrderStatus);
  return {
    id: order.id,
    orderCode,
    createdAt: new Date(order.createdAt).toISOString(),
    date: new Date(order.createdAt).toISOString().slice(0, 10),
    status: statusText,
    workflowStatus: statusText,
    total: Number(order.total || 0),
    items: Array.isArray(order.items) ? order.items : [],
    customer: {
      name: order.customerName || "",
      email: order.customerEmail || "",
      phone: order.customerPhone || "",
      dni: meta.dni,
      locationLine: meta.locationLine || order.customerDistrict || "",
      department: meta.department || "",
      province: meta.province || order.customerCity || "",
      district: meta.district || order.customerDistrict || "",
      address: meta.olvaAddress || order.customerAddress || "",
      reference: meta.olvaReference || "",
      shalomAgency: meta.shalomAgency || "",
      notes: meta.notes || "",
    },
    paymentMethod: meta.paymentMethod,
    paymentMethodLabel: paymentMethodLabel(meta.paymentMethod),
    shippingCarrier: meta.shippingCarrier,
    shippingCarrierLabel: shippingCarrierLabel(meta.shippingCarrier),
    shalomVoucherImage: meta.shalomVoucherImage || "",
    shalomPickupCode: meta.shalomPickupCode || "",
    olvaTrackingImage: meta.olvaTrackingImage || "",
    paymentImage: order.paymentImage || "",
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) return res.status(401).json({ error: "No autorizado" });

  if (req.method === "PATCH") {
    const id = String(req.query.id || "").trim();
    const body = req.body || {};
    const status = String(body.status || "").trim();
    if (!id || !status) return res.status(400).json({ error: "Datos incompletos" });

    const dbStatus = toDbStatus(status);
    if (!dbStatus) return res.status(400).json({ error: "Status invalido" });

    try {
      const existing = await db.order.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Pedido no encontrado" });
      const currentMeta = parseOrderMeta(existing.customerNotes);
      const nextMeta = {
        ...currentMeta,
        workflowStatus: status,
        shalomVoucherImage: String(body.shalomVoucherImage || currentMeta.shalomVoucherImage || "").trim(),
        shalomPickupCode: String(body.shalomPickupCode || currentMeta.shalomPickupCode || "").trim(),
        olvaTrackingImage: String(body.olvaTrackingImage || currentMeta.olvaTrackingImage || "").trim(),
      };

      if (dbStatus === "SHIPPED") {
        if (nextMeta.shippingCarrier === "SHALOM") {
          if (!nextMeta.shalomVoucherImage || !nextMeta.shalomPickupCode) {
            return res.status(400).json({ error: "Para Shalom debes adjuntar voucher y clave" });
          }
        } else if (nextMeta.shippingCarrier === "OLVA") {
          if (!nextMeta.olvaTrackingImage) {
            return res.status(400).json({ error: "Para Olva debes adjuntar tracking (voucher)" });
          }
        }
      }

      const updated = await db.order.update({
        where: { id },
        data: {
          status: dbStatus,
          customerNotes: encodeOrderMeta(nextMeta),
        },
      });
      return res.status(200).json(serializeOrder(updated));
    } catch {
      return res.status(500).json({ error: "No se pudo actualizar el pedido" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
