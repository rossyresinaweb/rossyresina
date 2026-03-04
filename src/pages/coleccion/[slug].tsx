import Head from "next/head";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Products from "@/components/Products";

interface Props {
  title: string;
  products: any[];
}

export default function CollectionPage({ title, products }: Props) {
  return (
    <div className="min-h-[70vh] px-6 py-12 bg-gradient-to-b from-gray-100 to-transparent">
      <Head>
        <title>{title} — Rossy Resina</title>
        <meta name="description" content={`Colección ${title} de productos seleccionados.`} />
      </Head>
      <div className="max-w-screen-2xl mx-auto">
{products.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow">
            <p className="text-lg">No hay productos en esta colección.</p>
            <Link href="/" className="inline-block mt-4 px-4 py-2 bg-amazon_blue text-white rounded hover:bg-amazon_yellow hover:text-black">Ir al inicio</Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow">
            <Products productData={products} />
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const { slug } = ctx.params || {};
  try {
    const productsPath = path.join(process.cwd(), "src", "data", "products.json");
    const collectionsPath = path.join(process.cwd(), "src", "data", "collections.json");
    const rawP = fs.readFileSync(productsPath, "utf-8");
    const rawC = fs.readFileSync(collectionsPath, "utf-8");
    const allProducts = JSON.parse(rawP);
    const allCollections = JSON.parse(rawC);
    const col = (allCollections || []).find((c: any) => String(c.slug) === String(slug));
    if (!col) return { notFound: true };
    const products = (allProducts || []).filter((p: any) => col.productIds.includes(p._id));
    return { props: { title: col.title, products } };
  } catch {
    return { props: { title: "Colección", products: [] } };
  }
};
