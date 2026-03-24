import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";

const db = prisma as any;
const productBaseSelect = {
  id: true,
  legacyId: true,
  code: true,
  barcode: true,
  sku: true,
  title: true,
  description: true,
  brand: true,
  category: true,
  image: true,
  price: true,
  oldPrice: true,
  isNew: true,
  stock: true,
};
const productLegacySelect = {
  id: true,
  legacyId: true,
  code: true,
  title: true,
  description: true,
  brand: true,
  category: true,
  image: true,
  price: true,
  oldPrice: true,
  isNew: true,
};

const normalizeImages = (images: any): string[] => {
  if (Array.isArray(images)) return images.map((x) => String(x || "").trim()).filter(Boolean);
  if (typeof images === "string") {
    return images
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
};

const hasMojibake = (value: string): boolean => {
  if (!value) return false;
  return /(Ãƒ.|Ã‚.|Ã¢.|Ã°.|ï¿½|Ãƒ|Ã‚|Ã¢|Ã°)/.test(value);
};

const fixMojibakeText = (value: any): string => {
  let out = String(value ?? "");
  // Heuristica para textos con UTF-8 mal interpretado como latin1/cp1252.
  for (let i = 0; i < 3; i += 1) {
    if (!hasMojibake(out)) break;
    const decoded = Buffer.from(out, "latin1").toString("utf8");
    if (!decoded || decoded === out) break;
    out = decoded;
  }
  return out;
};

const fixProductTextFields = (row: any) => ({
  ...row,
  code: fixMojibakeText(row?.code || ""),
  barcode: fixMojibakeText(row?.barcode || ""),
  title: fixMojibakeText(row?.title || ""),
  description: fixMojibakeText(row?.description || ""),
  brand: fixMojibakeText(row?.brand || ""),
  category: fixMojibakeText(row?.category || ""),
});

const normalizeStock = (value: any): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const sanitizeBarcode = (value: any): string | null => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8 && digits.length <= 32) return digits;
  const compact = raw.replace(/\s+/g, "");
  return compact || null;
};

const ean13CheckDigit = (base12: string): string => {
  const digits = base12.replace(/\D/g, "").slice(0, 12).padStart(12, "0");
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const n = Number(digits[i] || 0);
    sum += i % 2 === 0 ? n : n * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return String(check);
};

const randomEan13 = (): string => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`.replace(/\D/g, "");
  const base12 = seed.slice(-12).padStart(12, "0");
  return `${base12}${ean13CheckDigit(base12)}`;
};

const ensureUniqueBarcode = async (preferred: string | null, excludeId?: string): Promise<string> => {
  const exists = async (barcode: string): Promise<boolean> => {
    try {
      const found = await db.product.findFirst({
        where: excludeId
          ? { barcode, NOT: { id: excludeId } }
          : { barcode },
        select: { id: true },
      });
      return Boolean(found);
    } catch {
      // Si la columna aÃºn no existe en DB, dejamos pasar y usamos valor generado.
      return false;
    }
  };

  const candidate = sanitizeBarcode(preferred);
  if (candidate && !(await exists(candidate))) return candidate;

  for (let i = 0; i < 20; i += 1) {
    const next = randomEan13();
    if (!(await exists(next))) return next;
  }

  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const isCloudinaryUrl = (value: any): boolean => {
  const src = String(value || "").trim().toLowerCase();
  if (!src) return false;
  return src.includes("res.cloudinary.com") || src.includes("cloudinary.com");
};

const extractCloudinaryImages = (body: any): string[] => {
  const fromGallery = normalizeImages(body?.images).filter((img) => isCloudinaryUrl(img));
  const main = String(body?.image || "").trim();
  const fromMain = isCloudinaryUrl(main) ? [main] : [];
  return Array.from(new Set([...fromGallery, ...fromMain]));
};

const extractImagesFromStored = (row: any): string[] => {
  const gallery = normalizeImages(row?.images);
  const main = String(row?.image || "").trim();
  const mainArr = main ? [main] : [];
  return Array.from(new Set([...gallery, ...mainArr]));
};

const isPlaceholderImage = (value: any): boolean => {
  const src = String(value || "").trim().toLowerCase();
  if (!src) return true;
  return (
    src.includes("favicon") ||
    src.includes("sliderimg_") ||
    src.endsWith("/logo") ||
    src.includes("/logo.png") ||
    src.includes("/logo.jpg")
  );
};

const pickMainImage = (image: any, images: any): string => {
  const gallery = normalizeImages(images);
  const current = String(image || "").trim();
  const firstCloudinary = gallery.find((img) => /cloudinary\.com/i.test(String(img)));

  if (firstCloudinary && !/cloudinary\.com/i.test(current)) {
    return firstCloudinary;
  }
  if (current && !isPlaceholderImage(current)) {
    return current;
  }
  if (gallery.length > 0) {
    return gallery[0];
  }
  return "/favicon-96x96.png";
};

const toLegacyProduct = (p: any) => ({
  _id: p.legacyId ?? p.id,
  code: fixMojibakeText(p.code || ""),
  barcode: fixMojibakeText(p.barcode || ""),
  sku: fixMojibakeText(p.sku || ""),
  stock: normalizeStock(p.stock),
  title: fixMojibakeText(p.title || "Producto"),
  description: fixMojibakeText(p.description || ""),
  brand: fixMojibakeText(p.brand || ""),
  category: fixMojibakeText(p.category || ""),
  image: pickMainImage(p.image, p?.images),
  isNew: Boolean(p.isNew),
  oldPrice: p.oldPrice != null ? Number(p.oldPrice) : undefined,
  price: Number(p.price || 0),
  images: normalizeImages(p?.images),
});

const toLegacyFromCatalog = (p: any) => ({
  _id: p?._id ?? p?.id ?? p?.code ?? "",
  code: fixMojibakeText(p?.code || ""),
  barcode: fixMojibakeText(p?.barcode || ""),
  sku: fixMojibakeText(p?.sku || ""),
  stock: normalizeStock(p?.stock),
  title: fixMojibakeText(p?.title || "Producto"),
  description: fixMojibakeText(p?.description || ""),
  brand: fixMojibakeText(p?.brand || ""),
  category: fixMojibakeText(p?.category || ""),
  image: pickMainImage(p?.image, p?.images),
  isNew: Boolean(p?.isNew),
  oldPrice: p?.oldPrice != null ? Number(p.oldPrice) : undefined,
  price: Number(p?.price || 0),
  images: normalizeImages(p?.images),
});

const mergeProducts = (primaryRows: any[], secondaryRows: any[]) => {
  const map = new Map<string, any>();

  const upsert = (row: any, isPrimary: boolean) => {
    const codeKey = String(row?.code || "").trim().toLowerCase();
    const idKey = String(row?._id ?? "").trim();
    const key = codeKey || idKey;
    if (!key) return;

    const incoming = { ...row, images: normalizeImages(row?.images) };
    const existing = map.get(key);

    if (!existing) {
      map.set(key, incoming);
      return;
    }

    const nextImages =
      isPrimary
        ? incoming.images && incoming.images.length > 0
          ? incoming.images
          : existing.images && existing.images.length > 0
          ? existing.images
          : []
        : existing.images && existing.images.length > 0
        ? existing.images
        : incoming.images && incoming.images.length > 0
        ? incoming.images
        : [];

    map.set(key, {
      ...(isPrimary ? { ...existing, ...incoming } : { ...incoming, ...existing }),
      image: pickMainImage(
        (isPrimary ? incoming.image : existing.image) || (isPrimary ? existing.image : incoming.image) || "",
        nextImages
      ),
      images: nextImages,
    });
  };

  primaryRows.forEach((row) => upsert(row, true));
  secondaryRows.forEach((row) => upsert(row, false));

  return Array.from(map.values());
};

const enrichDbRowsWithCatalogImages = (dbRows: any[], catalogRows: any[]) => {
  const byCode = new Map<string, any>();
  const byId = new Map<string, any>();

  (Array.isArray(catalogRows) ? catalogRows : []).forEach((row: any) => {
    const codeKey = String(row?.code || "").trim().toLowerCase();
    const idKey = String(row?._id ?? row?.id ?? "").trim().toLowerCase();
    if (codeKey) byCode.set(codeKey, row);
    if (idKey) byId.set(idKey, row);
  });

  return (Array.isArray(dbRows) ? dbRows : []).map((row: any) => {
    const codeKey = String(row?.code || "").trim().toLowerCase();
    const idKey = String(row?._id ?? row?.id ?? "").trim().toLowerCase();
    const fromCatalog = (codeKey && byCode.get(codeKey)) || (idKey && byId.get(idKey)) || null;
    if (!fromCatalog) return row;

    const dbImages = normalizeImages(row?.images);
    const dbImage = String(row?.image || "").trim();
    const catalogImages = normalizeImages(fromCatalog?.images);
    const catalogImage = String(fromCatalog?.image || "").trim();
    const mergedImages = Array.from(new Set([...dbImages, ...catalogImages, ...(catalogImage ? [catalogImage] : [])]));

    return {
      ...row,
      images: mergedImages,
      image: pickMainImage(dbImage || catalogImage, mergedImages),
    };
  });
};

const toDbData = (body: any) => {
  const legacyId = String(body?._id ?? "").trim() || null;
  const code = fixMojibakeText(String(body?.code ?? "").trim()) || null;
  const title = fixMojibakeText(String(body?.title || "Producto").trim());
  const description = fixMojibakeText(String(body?.description || "").trim());
  const brand = fixMojibakeText(String(body?.brand || "").trim());
  const category = fixMojibakeText(String(body?.category || "").trim());
  const gallery = normalizeImages(body?.images);
  const image = pickMainImage(body?.image, gallery);
  const price = Number(body?.price || 0);
  const oldPrice = body?.oldPrice != null && body.oldPrice !== "" ? Number(body.oldPrice) : null;
  const isNew = Boolean(body?.isNew);
  const stock = normalizeStock(body?.stock);
  const barcode = sanitizeBarcode(body?.barcode);
  const sku = fixMojibakeText(String(body?.sku || "").trim()) || null;
  return { legacyId, code, barcode, sku, title, description, brand, category, image, images: gallery, price, oldPrice, isNew, stock };
};

const syncCatalogProduct = (payload: any) => {
  const catalog = readCatalog();
  const rows = Array.isArray(catalog) ? [...catalog] : [];

  const code = String(payload?.code || "").trim().toLowerCase();
  const id = String(payload?._id ?? "").trim();
  const idxByCode = code
    ? rows.findIndex((p: any) => String(p?.code || "").trim().toLowerCase() === code)
    : -1;
  const idxById =
    idxByCode >= 0
      ? -1
      : id
      ? rows.findIndex((p: any) => String(p?._id ?? "").trim() === id)
      : -1;
  const idx = idxByCode >= 0 ? idxByCode : idxById;

  const next = {
    ...(idx >= 0 ? rows[idx] : {}),
    ...fixProductTextFields(payload),
    images: normalizeImages(payload?.images),
  };

  if (idx >= 0) rows[idx] = next;
  else rows.unshift(next);

  try {
    writeCatalog(rows);
  } catch {
    // En Vercel el filesystem puede ser de solo lectura; no bloquear el guardado en DB.
  }
};

const removeCatalogProducts = (keys: string[], preferredCode?: string) => {
  try {
    const catalog = readCatalog();
    const rows = Array.isArray(catalog) ? catalog : [];
    const normalizedKeys = Array.from(
      new Set(
        (Array.isArray(keys) ? keys : [])
          .map((k) => String(k || "").trim().toLowerCase())
          .filter(Boolean)
      )
    );
    const code = String(preferredCode || "").trim().toLowerCase();
    if (normalizedKeys.length === 0 && !code) return;

    const next = rows.filter((p: any) => {
      const pId = String(p?._id ?? "").trim().toLowerCase();
      const pCode = String(p?.code || "").trim().toLowerCase();
      if (code) return pCode !== code;
      return !normalizedKeys.includes(pId) && !normalizedKeys.includes(pCode);
    });

    if (next.length !== rows.length) {
      try {
        writeCatalog(next);
      } catch {
        // Ignorar en entornos sin escritura local.
      }
    }
  } catch {
    // Ignorar fallos de filesystem en serverless.
  }
};

const isMissingImagesColumnError = (error: any) => {
  const msg = String(error?.message || "").toLowerCase();
  return (
    msg.includes("unknown arg `images`") ||
    msg.includes("unknown arg `stock`") ||
    msg.includes("unknown arg `barcode`") ||
    msg.includes("column") && msg.includes("images") && msg.includes("does not exist")
    || (msg.includes("column") && msg.includes("stock") && msg.includes("does not exist"))
    || (msg.includes("column") && msg.includes("barcode") && msg.includes("does not exist"))
  );
};

const stripImagesField = (data: any) => {
  const { images, stock, barcode, ...rest } = data || {};
  return rest;
};

const isTooManyClientsError = (error: any): boolean =>
  /too many clients|too many connections|too many database connections/i.test(
    String(error?.message || "")
  );

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withDbRetry = async <T>(run: () => Promise<T>, retries = 2): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await run();
    } catch (error: any) {
      lastError = error;
      if (!isTooManyClientsError(error) || attempt === retries) break;
      await wait(180 * (attempt + 1));
    }
  }
  throw lastError;
};

const toFriendlyDbError = (error: any, fallback: string): string => {
  if (isTooManyClientsError(error)) {
    return "Servidor ocupado temporalmente. Intenta nuevamente en unos segundos.";
  }
  return String(error?.message || fallback);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const firstQueryValue = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return String(value[0] || "").trim();
    return String(value || "").trim();
  };

  const isAdmin = async () => {
    const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
    return !!session && (session.user as any)?.role === "ADMIN";
  };

  if (req.method === "GET") {
    try {
      let products: any[] = [];
      try {
        products = await withDbRetry(() =>
          db.product.findMany({
          orderBy: { createdAt: "desc" },
          select: { ...productBaseSelect, images: true },
          })
        );
      } catch {
        products = await withDbRetry(() =>
          db.product.findMany({
          orderBy: { createdAt: "desc" },
          select: productLegacySelect,
          })
        );
      }
      const dbRows = products.map(toLegacyProduct);
      return res.status(200).json(dbRows);
    } catch (error: any) {
      return res.status(500).json({ error: toFriendlyDbError(error, "No se pudieron obtener productos") });
    }
  }

  if (req.method === "POST") {
    const ok = await isAdmin();
    if (!ok) return res.status(401).json({ error: "No autorizado" });

    try {
      const data = toDbData(req.body || {});
      const cloudinaryImages = extractCloudinaryImages(req.body || {});
      if (cloudinaryImages.length === 0) {
        return res.status(400).json({ error: "Debes subir al menos una imagen valida en Cloudinary." });
      }
      data.images = cloudinaryImages;
      data.image = isCloudinaryUrl(data.image) ? data.image : cloudinaryImages[0];
      // Permite barcode manual; si viene vacio, se genera automatico.
      data.barcode = await withDbRetry(() => ensureUniqueBarcode(data.barcode || null));
      if (!data.title || !Number.isFinite(data.price)) {
        return res.status(400).json({ error: "Datos de producto invalidos" });
      }

      const where = data.code ? { code: data.code } : data.legacyId ? { legacyId: data.legacyId } : null;
      let created: any;
      try {
        created = where
          ? await withDbRetry(() =>
              db.product.upsert({
              where,
              create: data,
              update: data,
              select: productBaseSelect,
            })
            )
          : await withDbRetry(() => db.product.create({ data, select: productBaseSelect }));
      } catch (error) {
        if (!isMissingImagesColumnError(error)) throw error;
        const legacyData = stripImagesField(data);
        created = where
          ? await withDbRetry(() =>
              db.product.upsert({
              where,
              create: legacyData,
              update: legacyData,
              select: productLegacySelect,
            })
            )
          : await withDbRetry(() => db.product.create({ data: legacyData, select: productLegacySelect }));
      }

      const responseRow = {
        ...toLegacyProduct(created),
        images: cloudinaryImages,
      };

      return res.status(201).json(responseRow);
    } catch (error: any) {
      return res.status(500).json({ error: toFriendlyDbError(error, "No se pudo crear producto") });
    }
  }

  if (req.method === "PUT") {
    const ok = await isAdmin();
    if (!ok) return res.status(401).json({ error: "No autorizado" });

    try {
      const data = toDbData(req.body || {});
      const cloudinaryImages = extractCloudinaryImages(req.body || {});
      const key = String((req.body || {})._id ?? "").trim();
      if (!key) return res.status(400).json({ error: "ID requerido" });

      let existing: any = null;
      if (data.code) {
        try {
          existing = await withDbRetry(() => db.product.findFirst({
            where: { code: data.code },
            select: { id: true, barcode: true, image: true, images: true },
          }));
        } catch (error) {
          if (!isMissingImagesColumnError(error)) throw error;
          existing = await withDbRetry(() => db.product.findFirst({
            where: { code: data.code },
            select: { id: true, image: true },
          }));
        }
      }
      if (!existing) {
        const orWhere: any[] = [{ id: key }, { legacyId: key }, { code: key }];
        try {
          existing = await withDbRetry(() => db.product.findFirst({
            where: { OR: orWhere },
            select: { id: true, barcode: true, image: true, images: true },
          }));
        } catch (error) {
          if (!isMissingImagesColumnError(error)) throw error;
          existing = await withDbRetry(() => db.product.findFirst({
            where: { OR: orWhere },
            select: { id: true, image: true },
          }));
        }
      }
      if (!existing) return res.status(404).json({ error: "Producto no encontrado" });

      const incomingImages = normalizeImages((req.body || {}).images);
      const incomingMain = String((req.body || {}).image || "").trim();
      const requestedImages = Array.from(
        new Set([...(incomingImages || []), ...(incomingMain ? [incomingMain] : [])])
      );
      const storedImages = Array.from(
        new Set([
          ...extractImagesFromStored(existing),
        ])
      );
      const storedCloudinaryImages = storedImages.filter((img) => isCloudinaryUrl(img));
      const requestedCloudinaryImages = requestedImages.filter((img) => isCloudinaryUrl(img));
      const preserveExistingImages = (req.body as any)?.preserveExistingImages !== false;
      const baseStored = storedCloudinaryImages.length > 0 ? storedCloudinaryImages : storedImages;
      const baseRequested = requestedCloudinaryImages.length > 0 ? requestedCloudinaryImages : requestedImages;
      const finalImages =
        baseRequested.length === 0
          ? baseStored
          : preserveExistingImages
          ? Array.from(new Set([...baseStored, ...baseRequested]))
          : baseRequested;
      if (finalImages.length === 0) {
        return res.status(400).json({ error: "Debes mantener al menos una imagen del producto." });
      }
      data.images = finalImages;
      data.image = pickMainImage(data.image, finalImages);
      // En edicion: si ingresan barcode manual, validarlo y usarlo.
      // Si viene vacio, conserva el existente; si no hay, genera uno.
      const requestedBarcode = sanitizeBarcode((req.body || {}).barcode);
      if (requestedBarcode) {
        data.barcode = await withDbRetry(() =>
          ensureUniqueBarcode(requestedBarcode, existing?.id ? String(existing.id) : undefined)
        );
      } else {
        data.barcode = existing?.barcode
          ? String(existing.barcode)
          : await withDbRetry(() =>
              ensureUniqueBarcode(null, existing?.id ? String(existing.id) : undefined)
            );
      }

      let updated: any;
      try {
        updated = existing
          ? await withDbRetry(() =>
              db.product.update({
              where: { id: existing.id },
              data,
              select: productBaseSelect,
            })
            )
          : await withDbRetry(() => db.product.create({ data, select: productBaseSelect }));
      } catch (error) {
        if (!isMissingImagesColumnError(error)) throw error;
        const legacyData = stripImagesField(data);
        updated = existing
          ? await withDbRetry(() =>
              db.product.update({
              where: { id: existing.id },
              data: legacyData,
              select: productLegacySelect,
            })
            )
          : await withDbRetry(() => db.product.create({ data: legacyData, select: productLegacySelect }));
      }

      const responseRow = {
        ...toLegacyProduct(updated),
        images: finalImages.length > 0 ? finalImages : cloudinaryImages,
      };

      return res.status(200).json(responseRow);
    } catch (error: any) {
      return res.status(500).json({ error: toFriendlyDbError(error, "No se pudo actualizar producto") });
    }
  }

  if (req.method === "DELETE") {
    const ok = await isAdmin();
    if (!ok) return res.status(401).json({ error: "No autorizado" });

    try {
      const key = firstQueryValue(req.query._id) || String(req.body?._id || "").trim();
      const code = firstQueryValue(req.query.code) || String(req.body?.code || "").trim();
      if (!key && !code) return res.status(400).json({ error: "ID o codigo requerido" });

      const existing = code
        ? await withDbRetry(() => db.product.findFirst({
            where: { code },
            select: { id: true, legacyId: true, code: true },
          }))
        : await withDbRetry(() => db.product.findFirst({
            where: {
              OR: [{ id: key }, { legacyId: key }, { code: key }],
            },
            select: { id: true, legacyId: true, code: true },
          }));

      if (existing) {
        await withDbRetry(() => db.product.delete({ where: { id: existing.id } }));
      }

      return res.status(204).end();
    } catch (error: any) {
      return res.status(500).json({ error: toFriendlyDbError(error, "No se pudo eliminar producto") });
    }
  }

  return res.status(405).json({ error: "Metodo no permitido" });
}





