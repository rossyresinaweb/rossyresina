import Head from "next/head";
 
import Link from "next/link";
import { FaFacebook, FaTwitter, FaLinkedin, FaPinterest, FaRss } from "react-icons/fa";
import fs from "fs";
import path from "path";

type Post = {
  slug: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  content: string[];
  image?: string;
};

interface Props { post: Post; recent: Post[] }

export default function BlogDetailPage({ post, recent }: Props) {
  const categories = [
    { href: "/categoria/resina", label: "Resina" },
    { href: "/categoria/moldes-de-silicona", label: "Moldes de silicona" },
    { href: "/categoria/pigmentos", label: "Pigmentos" },
    { href: "/categoria/accesorios", label: "Accesorios" },
  ];
  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">
      <Head>
        <title>Rossy Resina — {post ? post.title : "Blog"}</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {post?.image ? (
              <div className="relative h-48 md:h-64">
                <img src={((): string => { const s = String(post.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()} alt={post.title} className="object-cover w-full h-full" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-200/60 to-transparent" />
              </div>
            ) : (
              <div className="h-40 bg-amazon_blue" />
            )}
            <div className="p-5">
              <h1 className="text-2xl font-semibold text-amazon_blue">{post?.title}</h1>
              <div className="mt-1 text-sm text-gray-600 flex items-center gap-3">
                <span>{post?.author}</span>
                <span>·</span>
                <span>{post?.date}</span>
                <span>·</span>
                <span>{post?.comments} comentarios</span>
              </div>
              <div className="mt-4 grid gap-4 text-gray-800">
                {post?.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4 text-gray-600">
                <span>Compartir:</span>
                <a href="#" aria-label="Facebook" className="hover:text-brand_teal"><FaFacebook /></a>
                <a href="#" aria-label="Twitter" className="hover:text-brand_teal"><FaTwitter /></a>
                <a href="#" aria-label="LinkedIn" className="hover:text-brand_teal"><FaLinkedin /></a>
                <a href="#" aria-label="RSS" className="hover:text-brand_teal"><FaRss /></a>
                <a href="#" aria-label="Pinterest" className="hover:text-brand_teal hidden sm:inline"><FaPinterest /></a>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
            <div className="mt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amazon_blue" />
              <div>
                <p className="font-semibold">{post?.author}</p>
                <p className="text-sm text-gray-600">Sigue nuestras novedades y tips en resina.</p>
              </div>
            </div>
          </div>
        </div>
        <aside className="grid gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold">Categorías</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {categories.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="px-2 py-1 rounded hover:bg-gray-100 inline-block">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold">Entradas recientes</h3>
            <ul className="mt-3 grid gap-3 text-sm">
              {recent.map((p) => (
                <li key={`recent-${p.slug}`} className="border-b border-gray-200 pb-2">
                  <Link href={`/blog/${p.slug}`} className="font-medium text-amazon_blue hover:underline hover:text-brand_teal">
                    {p.title}
                  </Link>
                  <p className="text-gray-600 mt-1">{p.date}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx: any) => {
  const slug = String(ctx.params.slug || "");
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "blog.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const items: Post[] = JSON.parse(raw);
    const post = items.find((p) => String(p.slug) === slug);
    if (!post) return { notFound: true };
    const recent = items.filter((p) => String(p.slug) !== slug).slice(0, 3);
    return { props: { post, recent } };
  } catch (e) {
    return { notFound: true };
  }
};
