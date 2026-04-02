import type { ProductProps } from "../../../type";
import prisma from "@/lib/prisma";
const productBaseSelect = {
  id: true,
  legacyId: true,
  code: true,
  barcode: true,
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
  if (firstCloudinary && !/cloudinary\.com/i.test(current)) return firstCloudinary;
  if (current && !isPlaceholderImage(current)) return current;
  if (gallery.length > 0) return gallery[0];
  return "";
};

const toLegacyFromDb = (p: any): ProductProps => ({
  _id: p?.legacyId ?? p?.id,
  code: p?.code || "",
  barcode: p?.barcode || "",
  stock: Number(p?.stock || 0),
  title: p?.title || "Producto",
  description: p?.description || "",
  brand: p?.brand || "",
  category: p?.category || "",
  image: pickMainImage(p?.image, p?.images),
  images: normalizeImages(p?.images),
  isNew: Boolean(p?.isNew),
  oldPrice: p?.oldPrice != null ? Number(p.oldPrice) : undefined,
  price: Number(p?.price || 0),
});

const toSerializable = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export async function getAllProducts(): Promise<ProductProps[]> {
  try {
    const dbRows = await (prisma as any).product.findMany({
      orderBy: { createdAt: "desc" },
      select: { ...productBaseSelect, images: true },
    });
    return toSerializable((dbRows || []).map(toLegacyFromDb));
  } catch {
    return [];
  }
}
