import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { upsertCustomer } from "@/lib/customerStore";
import {
  encodeOrderMeta,
  normalizePaymentMethod,
  normalizeShippingCarrier,
  parseOrderMeta,
  paymentMethodLabel,
  shippingCarrierLabel,
} from "@/lib/orderMeta";

type DbOrderStatus = "PENDING" | "PAID" | "SHIPPED";
const db = prisma as any;

type IncomingItem = {
  _id?: string | number;
  productId?: string | number;
  code?: string;
  quantity?: number;
};

const toLegacyStatus = (status: DbOrderStatus): string => {
  if (status === "PAID") return "Confirmado";
  if (status === "SHIPPED") return "Enviado";
  return "Pendiente por confirmar";
};

const splitLocation = (locationLine: string) => {
  const source = String(locationLine || "").trim();
  const parts = source
    .split(/[,\-\/|]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    department: parts[0] || "",
    province: parts[1] || "",
    district: parts[2] || "",
  };
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
  if (req.method === "GET") {
    const email = String(req.query.email || "").trim().toLowerCase();
    const includeHistory = String(req.query.includeHistory || "").trim() === "1";
    try {
      if (email) {
        const orders = await db.order.findMany({
          where: { customerEmail: email },
          orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(orders.map(serializeOrder));
      }
      const session = await getServerSession(req, res, authOptions as any);
      const role = (session?.user as any)?.role;
      if (!session) return res.status(401).json({ error: "No autorizado" });

      if (role === "ADMIN") {
        const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
        const serialized = orders.map(serializeOrder);
        if (includeHistory) return res.status(200).json(serialized);
        const now = Date.now();
        const active = serialized.filter((o: any) => {
          if (String(o.workflowStatus || "").toLowerCase() !== "finalizado") return true;
          const createdAtMs = new Date(String(o.createdAt || "")).getTime();
          if (!Number.isFinite(createdAtMs)) return true;
          return now - createdAtMs < 2 * 60 * 60 * 1000;
        });
        return res.status(200).json(active);
      }

      const sessionEmail = String((session.user as any)?.email || "").trim().toLowerCase();
      if (!sessionEmail) return res.status(200).json([]);
      const user = await db.user.findUnique({ where: { email: sessionEmail } });
      const orders = await db.order.findMany({
        where: {
          OR: [
            { customerEmail: sessionEmail },
            ...(user?.id ? [{ userId: user.id }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(orders.map(serializeOrder));
    } catch {
      return res.status(500).json({ error: "No se pudieron obtener pedidos" });
    }
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const customer = body.customer || {};
    const items = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];

    const name = String(customer.name || "").trim();
    const dni = String(customer.dni || "").trim();
    const phone = String(customer.phone || "").trim();
    const email = String(customer.email || "").trim().toLowerCase();
    const locationLine = String(customer.locationLine || "").trim();
    const notes = String(customer.notes || "").trim();

    const shippingCarrier = normalizeShippingCarrier(body.shippingCarrier || customer.shippingCarrier);
    const shalomAgency = String(body.shalomAgency || customer.shalomAgency || "").trim();
    const olvaAddress = String(body.olvaAddress || customer.olvaAddress || "").trim();
    const olvaReference = String(body.olvaReference || customer.olvaReference || "").trim();

    const paymentMethod = normalizePaymentMethod(body.paymentMethod || customer.paymentMethod);
    const paymentImage = String(body.paymentImage || "").trim();

    if (!name) return res.status(400).json({ error: "Nombre completo requerido" });
    if (!dni || dni.length < 6) return res.status(400).json({ error: "DNI requerido" });
    if (!phone) return res.status(400).json({ error: "Telefono requerido" });
    if (!locationLine) return res.status(400).json({ error: "Departamento, provincia y distrito requeridos" });
    if (items.length === 0) return res.status(400).json({ error: "Carrito vacio" });

    if (shippingCarrier === "SHALOM" && !shalomAgency) {
      return res.status(400).json({ error: "Debes indicar la agencia Shalom" });
    }
    if (shippingCarrier === "OLVA" && (!olvaAddress || !olvaReference)) {
      return res.status(400).json({ error: "Para Olva Courier debes indicar direccion y referencia" });
    }

    if (!paymentImage) {
      return res.status(400).json({ error: "Debes adjuntar comprobante de pago" });
    }
    if (paymentImage.length > 4_000_000) {
      return res.status(400).json({ error: "El comprobante es demasiado pesado" });
    }

    const location = splitLocation(locationLine);

    try {
      const keys = Array.from(
        new Set(
          items
            .flatMap((it) => [
              String(it.productId ?? "").trim(),
              String(it._id ?? "").trim(),
              String(it.code ?? "").trim(),
            ])
            .filter(Boolean)
        )
      );
      if (keys.length === 0) return res.status(400).json({ error: "Items invalidos" });

      const products = await db.product.findMany({
        where: {
          OR: [
            { id: { in: keys } },
            { legacyId: { in: keys } },
            { code: { in: keys } },
          ],
        },
        select: {
          id: true,
          legacyId: true,
          code: true,
          title: true,
          price: true,
        },
      });

      const byId = new Map(products.map((p) => [String(p.id), p]));
      const byLegacyId = new Map(products.filter((p) => p.legacyId).map((p) => [String(p.legacyId), p]));
      const byCode = new Map(products.filter((p) => p.code).map((p) => [String(p.code), p]));
      const normalizedItems: Array<{
        productId: string;
        legacyId: string | null;
        code: string | null;
        title: string;
        quantity: number;
        price: number;
      }> = [];

      let computedTotal = 0;
      for (const item of items) {
        const candidateKeys = [
          String(item.productId ?? "").trim(),
          String(item._id ?? "").trim(),
          String(item.code ?? "").trim(),
        ].filter(Boolean);
        const qty = Math.max(1, Number(item.quantity || 1));
        const product = candidateKeys
          .map((k) => byId.get(k) || byLegacyId.get(k) || byCode.get(k))
          .find(Boolean);
        if (!product) {
          return res.status(400).json({
            error: `Producto no encontrado: ${candidateKeys[0] || "sin-id"}`,
          });
        }
        const price = Number(product.price);
        computedTotal += price * qty;
        normalizedItems.push({
          productId: product.id,
          legacyId: product.legacyId || null,
          code: product.code || null,
          title: product.title,
          quantity: qty,
          price,
        });
      }

      const session = await getServerSession(req, res, authOptions as any);
      const sessionEmail = String((session?.user as any)?.email || "").trim().toLowerCase();
      const user = sessionEmail
        ? await db.user.findUnique({ where: { email: sessionEmail } })
        : email
        ? await db.user.findUnique({ where: { email } })
        : null;

      const created = await db.order.create({
        data: {
          userId: user?.id || null,
          status: "PENDING",
          total: computedTotal,
          items: normalizedItems as any,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: shippingCarrier === "OLVA" ? olvaAddress : `Agencia Shalom: ${shalomAgency}`,
          customerCity: location.province || "",
          customerDistrict: location.district || locationLine,
          customerNotes: encodeOrderMeta({
            orderCode: "",
            workflowStatus: "Pendiente por confirmar",
            paymentMethod,
            shippingCarrier,
            dni,
            locationLine,
            department: location.department,
            province: location.province,
            district: location.district,
            shalomAgency,
            olvaAddress,
            olvaReference,
            shalomVoucherImage: "",
            shalomPickupCode: "",
            olvaTrackingImage: "",
            notes,
          }),
          paymentImage,
        },
      });
      const orderCode = buildOrderCode(new Date(created.createdAt), String(created.id || ""));
      const currentMeta = parseOrderMeta(created.customerNotes);
      const updated = await db.order.update({
        where: { id: created.id },
        data: {
          customerNotes: encodeOrderMeta({
            ...currentMeta,
            orderCode,
          }),
        },
      });

      await upsertCustomer({
        dni,
        name,
        phone,
        locationLine,
        shippingCarrier,
        shalomAgency,
        olvaAddress,
        olvaReference,
      });

      return res.status(201).json(serializeOrder(updated));
    } catch {
      return res.status(500).json({ error: "No se pudo crear el pedido" });
    }
  }

  return res.status(405).json({ error: "M?todo no permitido" });
}
