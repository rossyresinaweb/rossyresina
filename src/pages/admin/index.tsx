import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

interface Product {
  _id: number;
  code?: string;
  measure?: string;
  priceBulk12?: number;
  priceBulk3?: number;
  title: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  isNew: boolean;
  oldPrice?: number;
  price: number;
}

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const lib: any = (window as any).pdfjsLib;
    if (lib && lib.GlobalWorkerOptions) {
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    await fetch(`/api/products?_id=${id}`, { method: "DELETE" });
    load();
  };

  const parseLine = (line: string) => {
    const raw = line.trim();
    if (!raw) return null;
    const parts = raw.split(/\s*;\s*/);
    if (parts.length >= 3) {
      const [code, title, category, priceStr] = parts;
      const price = priceStr ? Number(String(priceStr).replace(/[^0-9.,]/g, "").replace(",", ".")) : 0;
      return { code, title, category, price: isNaN(price) ? 0 : price };
    }
    // Try hyphen format: CODE - TITLE - CATEGORY - S/ PRICE - DESCRIPTION
    const parts2 = raw.split(/\s*-\s*/);
    if (parts2.length >= 3) {
      const [code, title, category, priceMaybe] = parts2;
      const price = Number(String(priceMaybe || "").replace(/[^0-9.,]/g, "").replace(",", "."));
      return { code, title, category, price: isNaN(price) ? 0 : price };
    }
    // Fallback: TITLE;CATEGORY;PRICE;DESCRIPTION
    const parts3 = raw.split(/\s*;\s*/);
    if (parts3.length >= 2) {
      const [title, category, priceStr] = parts3;
      const price = priceStr ? Number(String(priceStr).replace(/[^0-9.,]/g, "").replace(",", ".")) : 0;
      return { code: undefined, title, category, price: isNaN(price) ? 0 : price };
    }
    return null;
  };

  const bulkImport = async () => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setImporting(true);
    try {
      for (const line of lines) {
        const parsed = parseLine(line);
        if (!parsed) continue;
        const category = selectedCategory || parsed.category || "Resinas";
        const body = {
          code: parsed.code,
          title: parsed.title,
          brand: "Rossy Resina",
          category,
          description: "",
          image: "/favicon-96x96.png",
          isNew: true,
          price: parsed.price || 0,
        };
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      setText("");
      await load();
    } finally {
      setImporting(false);
    }
  };

  const cleanAllText = () => {
    const lines = text.split(/\r?\n/);
    const cleaned = lines.map((raw) => {
      const l = String(raw || "").trim();
      if (!l) return "";
      const parts = l.split(/\s*;\s*/);
      // Expect: code;title;category;price
      let code = parts[0] || "";
      let title = parts[1] || "";
      let category = selectedCategory || parts[2] || "";
      let priceStr = parts[3] || parts[parts.length - 1] || "0";
      code = code.replace(/\s+/g, "");
      const tClean = title
        .replace(/\b\d+(?:[.,]\d+)?\s?(?:cm|mm|m|kg|g|ml|l|litro|unid(?:ades)?|x\d+)\b/gi, "")
        .replace(/\bsem\b/gi, "")
        .replace(/S\//gi, "")
        .replace(/\$/g, "")
        .replace(/[|–—\-]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      const priceNum = Number(String(priceStr).replace(/[^0-9.,]/g, "").replace(",", "."));
      const price = isNaN(priceNum) ? "0" : String(priceNum);
      const cat = category || "Resinas";
      const titleOut = tClean || code || "Producto";
      return `${code};${titleOut};${cat};${price}`;
    }).filter(Boolean);
    setText(cleaned.join("\n"));
  };

  const readPdfArrayBuffer = (file: File) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const extractFromPdf = async () => {
    if (!pdfFile) return;
    setPdfBusy(true);
    try {
      const buf = await readPdfArrayBuffer(pdfFile);
      const lib: any = (window as any).pdfjsLib;
      if (!lib) return;
      const doc = await lib.getDocument({ data: buf }).promise;
      let lines: string[] = [];
      let currentCategory: string | null = null;
      const catLabels = [
        "Resinas",
        "Resina",
        "Pigmentos",
        "Accesorios",
        "Moldes de silicona",
        "Moldes",
        "Creaciones",
        "Talleres",
        "Kits",
        "Kits Rossy",
      ];
      const asCanon = (s: string) => {
        const t = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (t.includes("resina")) return "Resinas";
        if (t.includes("pigment")) return "Pigmentos";
        if (t.includes("molde")) return "Moldes de silicona";
        if (t.includes("accesor")) return "Accesorios";
        if (t.includes("creacion")) return "Creaciones";
        if (t.includes("taller")) return "Talleres";
        if (t.includes("kit")) return "Kits Rossy";
        return s;
      };
      const codeRe = /[A-Za-z]{2,}[\- ]?\d{2,}/;
      const priceRe = /(?:S\/)?\s*\d+(?:[.,]\d{2})?/;
      const numberOnlyRe = /^\s*\d+(?:[.,]\d{2})?\s*$/;
      const looksMeasure = (s: string) => /cm|mm|m|kg|g|ml|l|litro|unid|x\d+/i.test(s);
      const looksCurrency = (s: string) => /\$|S\//i.test(s);
      const isShortNoise = (s: string) => s.length <= 2 || /^[^\w]+$/.test(s) || /^\w{1,2}$/i.test(s);
      const cleanTitle = (s: string) => {
        let t = s;
        t = t.replace(/\b\d+(?:[.,]\d+)?\s?(?:cm|mm|m|kg|g|ml|l|litro|unid(?:ades)?|x\d+)\b/gi, "");
        t = t.replace(/\b\d+(?:[.,]\d+)?\s?em\b/gi, "");
        t = t.replace(/\b\d+\/\d+(?:[.,]\d+)?\b/gi, "");
        t = t.replace(/\bsem\b/gi, "");
        t = t.replace(/S\//gi, "");
        t = t.replace(/\$/g, "");
        t = t.replace(/[|–—\-]+/g, " ");
        t = t.replace(/\s{2,}/g, " ");
        return t.trim();
      };
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const tc = await page.getTextContent();
        const tokens = tc.items
          .map((it: any) => String(it.str))
          .map((s: string) => s.replace(/\s+/g, " ").trim())
          .filter(Boolean);
        let pageAdded = 0;
        for (let t = 0; t < tokens.length; t++) {
          const tok = tokens[t];
          if (catLabels.includes(tok)) {
            currentCategory = asCanon(tok);
            continue;
          }
          if (!currentCategory && catLabels.some((c) => tok.toLowerCase().includes(c.toLowerCase()))) {
            currentCategory = asCanon(tok);
            continue;
          }
          if (!codeRe.test(tok)) continue;
          let nameParts: string[] = [];
          for (let k = Math.max(0, t - 6); k < t; k++) {
            const prev = tokens[k];
            if (codeRe.test(prev)) { nameParts = []; continue; }
            if (catLabels.some((c) => prev.toLowerCase().includes(c.toLowerCase()))) { nameParts = []; continue; }
            if (!priceRe.test(prev)) nameParts.push(prev);
          }
          let measureTok = "";
          let numbers: string[] = [];
          let tailWords: string[] = [];
          for (let j = t + 1; j < Math.min(tokens.length, t + 24); j++) {
            const candidate = tokens[j];
            if (priceRe.test(candidate) || numberOnlyRe.test(candidate)) {
              numbers.push(candidate);
              continue;
            }
            if (looksMeasure(candidate) || looksCurrency(candidate) || isShortNoise(candidate)) {
              continue;
            }
            tailWords.push(candidate);
          }
          if (!numbers.length || !currentCategory) continue;
          const code = tok.match(codeRe)![0].replace(/\s+/g, "");
          const toNum = (s: string) => Number(String(s).replace(/[^0-9.,]/g, "").replace(",", "."));
          let price = 0, bulk12: number | undefined, bulk3: number | undefined;
          if (numbers.length >= 3) {
            bulk12 = toNum(numbers[0]);
            bulk3 = toNum(numbers[1]);
            price = toNum(numbers[numbers.length - 1]);
          } else if (numbers.length === 2) {
            bulk3 = toNum(numbers[0]);
            price = toNum(numbers[1]);
          } else {
            price = toNum(numbers[0]);
          }
          const rawTitle = (nameParts.length ? nameParts.join(" ") : tailWords.join(" "))
            .replace(/Precio:?/gi, "")
            .replace(/S\//gi, "")
            .replace(/\s{2,}/g, " ")
            .trim();
          const title = cleanTitle(rawTitle).length ? cleanTitle(rawTitle) : code;
          const line = [code, title, currentCategory, isNaN(price) ? "0" : String(price)].join(";");
          lines.push(line);
          pageAdded++;
        }
        if (pageAdded === 0) {
          const tesseract: any = (window as any).Tesseract;
          if (tesseract) {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx as any, viewport }).promise;
            const result = await tesseract.recognize(canvas, "spa");
            const text = String(result?.data?.text || "");
            const rows = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
            for (const r of rows) {
              const codeMatch = r.match(codeRe);
              if (!codeMatch) continue;
              const nums = r.match(/\d+(?:[.,]\d{2})?/g) || [];
              if (!nums.length) continue;
              const code = codeMatch[0].replace(/\s+/g, "");
              const price = nums.length ? nums[nums.length - 1] : "0";
              const t0 = r.replace(codeMatch[0], "").replace(price, "").replace(/\s{2,}/g, " ").trim();
              const title = cleanTitle(t0) || code;
              const cat = currentCategory || "Resinas";
              const line = [code, title, cat, price].join(";");
              lines.push(line);
            }
          }
        }
      }
      let unique = Array.from(new Set(lines));
      if (unique.length === 0) {
        const tesseract: any = (window as any).Tesseract;
        if (tesseract) {
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx as any, viewport }).promise;
            const result = await tesseract.recognize(canvas, "spa");
            const text = String(result?.data?.text || "");
            const rows = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
            for (const r of rows) {
              const codeMatch = r.match(/[A-Za-z]{2,}[\- ]?\d{2,}/);
              const nums = r.match(/\d+(?:[.,]\d{2})?/g) || [];
              if (!codeMatch || nums.length === 0) continue;
              const code = codeMatch[0].replace(/\s+/g, "");
              const price = nums.length ? nums[nums.length - 1] : "0";
              const title = r.replace(codeMatch[0], "").replace(price, "").replace(/\s{2,}/g, " ").trim();
              const cat = currentCategory || "Resinas";
              unique.push([code, title || code, cat, price].join(";"));
            }
          }
          unique = Array.from(new Set(unique));
        }
      }
      setText(unique.join("\n"));
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/tesseract.js@v2.1.5/dist/tesseract.min.js" strategy="lazyOnload" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Administrador de productos</h1>
        <Link href="/admin/new" className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black">
          Nuevo producto
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Importar desde PDF</h2>
        <div className="flex items-center gap-3 mb-3">
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
          <button onClick={extractFromPdf} disabled={pdfBusy || !pdfFile} className="px-4 py-2 rounded-md bg-brand_teal text-white hover:opacity-90 disabled:opacity-60">
            {pdfBusy ? "Procesando..." : "Extraer"}
          </button>
        </div>
        <p className="text-sm text-gray-600">Tras extraer, revisa el texto abajo y pulsa Importar.</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Importar desde texto</h2>
        <p className="text-sm text-gray-600 mb-3">Formato: <code>CODIGO;TÍTULO;CATEGORÍA;PRECIO</code>. Se crearán productos sin imagen.</p>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-700">Categoría:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1">
            <option value="">(auto del texto)</option>
            <option>Resinas</option>
            <option>Pigmentos</option>
            <option>Moldes de silicona</option>
            <option>Accesorios</option>
            <option>Creaciones</option>
            <option>Talleres</option>
            <option>Kits</option>
          </select>
          <button onClick={cleanAllText} className="px-3 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">Limpiar texto</button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="RR-0001;Resina Epóxica 1:1;Resinas;70\nPG-010;Pigmento Azul;Pigmentos;12"
        />
        <div className="mt-3 flex items-center gap-2">
          <button onClick={bulkImport} disabled={importing} className="px-4 py-2 rounded-md bg-brand_teal text-white hover:opacity-90 disabled:opacity-60">
            {importing ? "Importando..." : "Importar"}
          </button>
          <button onClick={() => setText("")} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">Limpiar</button>
        </div>
      </div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((p) => (
            <div key={p._id} className="bg-white rounded-lg border border-gray-200 p-4">
              {p.image && (
                <Image
                  src={((): string => {
                    const s = String(p.image || "");
                    let u = s.replace(/\\/g, "/");
                    if (/^https?:\/\//i.test(u)) return u;
                    return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png";
                  })()}
                  alt={p.title}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <h2 className="mt-2 text-lg font-semibold">{p.title}</h2>
              {p.code && <p className="text-xs text-gray-500">Código: {p.code}</p>}
              <p className="text-sm text-gray-600">{p.category} · {p.brand}</p>
              {p.measure && <p className="text-xs text-gray-500">Medidas: {p.measure}</p>}
              {(typeof p.priceBulk12 === "number" || typeof p.priceBulk3 === "number") && (
                <p className="text-xs text-gray-500">X12: {typeof p.priceBulk12 === "number" ? p.priceBulk12 : "-"} · X3: {typeof p.priceBulk3 === "number" ? p.priceBulk3 : "-"}</p>
              )}
              <p className="text-sm text-gray-600 truncate">{p.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Link href={`/admin/edit/${p._id}`} className="px-3 py-2 rounded-md bg-brand_teal text-white hover:opacity-90">Editar</Link>
                <button onClick={() => remove(p._id)} className="px-3 py-2 rounded-md bg-red-600 text-white hover:opacity-90">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) {
    return { redirect: { destination: "/sign-in?callbackUrl=/admin", permanent: false } };
  }
  return { props: {} };
};
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";
