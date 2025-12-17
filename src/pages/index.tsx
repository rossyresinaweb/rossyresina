import HeroCarousel from "@/components/HeroCarousel";
import Products from "@/components/Products";
import { ProductProps } from "../../type";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setAllProducts } from "@/store/nextSlice";
import Link from "next/link";
import fs from "fs";
import path from "path";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import { HiOutlineMenu } from "react-icons/hi";

interface Props {
  productData: ProductProps[];
  collections: any[];
  blogPosts: any[];
  videos?: any[];
}

export default function Home({ productData, collections, blogPosts, videos }: Props) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    dispatch(setAllProducts({ allProducts: productData }));
  }, [productData, dispatch]);
  return (
    <main>
      <div className="max-w-screen-2xl mx-auto">
        <div className="px-6 mt-6 grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
          <aside className="md:col-span-1 rounded-lg min-h-[240px] md:min-h-[320px] lg:min-h-[384px] overflow-hidden">
            <div className="border border-black rounded-md overflow-hidden">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                <HiOutlineMenu className="text-gray-600" />
                Categorías
              </div>
              <ul className="text-sm divide-y divide-black">
                <li><Link className="block px-4 py-2 hover:bg-gray-50" href="/categoria/resina">Resinas</Link></li>
                <li><Link className="block px-4 py-2 hover:bg-gray-50" href="/categoria/moldes-de-silicona">Moldes de silicona</Link></li>
                <li><Link className="block px-4 py-2 hover:bg-gray-50" href="/categoria/pigmentos">Pigmentos</Link></li>
                <li><Link className="block px-4 py-2 hover:bg-gray-50" href="/categoria/accesorios">Accesorios</Link></li>
                <li><Link className="block px-4 py-2 hover:bg-gray-50" href="/categoria/creaciones">Proyectos en resina</Link></li>
                <li><Link className="block px-4 py-2 hover:bg-gray-50" href="/categoria/talleres">Talleres en resina epoxi</Link></li>
              </ul>
            </div>
          </aside>
          <div className="md:col-span-4">
            <HeroCarousel />
          </div>
        </div>
        <div className="px-6"><div className="border-t border-black my-6"></div></div>
        <div className="px-6 mt-6">
          <h2 className="text-xl font-semibold mb-3">Colecciones destacadas</h2>
          {Array.isArray(collections) && collections.length > 0 ? (
            <Carousel autoPlay={false} infiniteLoop showStatus={false} showThumbs={false} showIndicators={false} showArrows emulateTouch swipeable>
              {(() => {
                const groups: any[] = [];
                for (let i = 0; i < collections.length; i += 4) groups.push(collections.slice(i, i + 4));
                return groups.map((group: any[], idx: number) => (
                  <div key={`col-group-${idx}`} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {group.map((c: any) => (
                      <Link key={c.slug} href={`/coleccion/${c.slug}`} className="group rounded-lg overflow-hidden">
                        <Image src={c.cover || "/favicon-96x96.png"} alt={c.title} width={400} height={300} className="object-cover w-full h-36 md:h-40 group-hover:scale-105 transition-transform" />
                        <div className="p-2 flex items-center justify-between">
                          <span className="text-sm font-medium line-clamp-1">{c.title}</span>
                          <span className="text-xs text-gray-600">{Array.isArray(c.productIds) ? c.productIds.length : 0} ítems</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ));
              })()}
            </Carousel>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg p-6">
                <p className="text-sm text-gray-600">Aún no hay colecciones.</p>
              </div>
            </div>
          )}
        </div>
        <div className="px-6"><div className="border-t border-black my-6"></div></div>
        <div className="px-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg overflow-hidden">
            <div className="relative h-32 md:h-40 lg:h-44">
              <Image src="/sliderImg_2.svg" alt="banner 1" fill className="object-cover" />
            </div>
          </div>
          <div className="rounded-lg overflow-hidden">
            <div className="relative h-32 md:h-40 lg:h-44">
              <Image src="/sliderImg_3.svg" alt="banner 2" fill className="object-cover" />
            </div>
          </div>
          <div className="rounded-lg overflow-hidden">
            <div className="relative h-32 md:h-40 lg:h-44">
              <Image src="/sliderImg_1.svg" alt="banner 3" fill className="object-cover" />
            </div>
          </div>
        </div>
        <div className="px-6"><div className="border-t border-black my-6"></div></div>
        
        
        <div className="mt-8 md:mt-10 xl:mt-12 mb-10 px-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <aside className="md:col-span-1 p-2 h-fit">
            <div className="text-lg font-semibold">Blogs</div>
            <ul className="mt-2 text-sm divide-y divide-black border border-black rounded-md">
              {(blogPosts || []).slice(0, 8).map((b: any) => (
                <li key={b.slug || b.title}>
                  <Link href={b.slug ? `/blog/${b.slug}` : "#"} className="block px-3 py-2">
                    {b.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-lg font-semibold">Videos</div>
            <ul className="mt-2 text-sm divide-y divide-black border border-black rounded-md">
              {(videos || []).slice(0, 6).map((v: any, idx: number) => (
                <li key={v.id || v.slug || v.url || `video-${idx}`}>
                  {v.url ? (
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2">
                      {v.title || v.name || "Video"}
                    </a>
                  ) : (
                    <span className="block px-3 py-2">{v.title || v.name || "Video"}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 text-lg font-semibold">Ofertas</div>
            <div className="mt-3 rounded-lg overflow-hidden">
              <div className="relative h-28">
                <Image src="/products/resina-epoxica.png" alt="Oferta" fill className="object-cover" />
              </div>
            </div>
          </aside>
          <section className="md:col-span-3">
            <Products productData={productData} />
          </section>
        </div>
      </div>
    </main>
  );
}

// SSR for data fetching
export const getServerSideProps = async () => {
  try {
    const dataPath = path.join(process.cwd(), "src", "data", "products.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const productData = JSON.parse(raw);
    const colPath = path.join(process.cwd(), "src", "data", "collections.json");
    let collections: any[] = [];
    try {
      collections = JSON.parse(fs.readFileSync(colPath, "utf-8"));
    } catch {}
    let blogPosts: any[] = [];
    try {
      const blogPath = path.join(process.cwd(), "src", "data", "blog.json");
      blogPosts = JSON.parse(fs.readFileSync(blogPath, "utf-8"));
    } catch {}
    let videos: any[] = [];
    try {
      const videosPath = path.join(process.cwd(), "src", "data", "videos.json");
      videos = JSON.parse(fs.readFileSync(videosPath, "utf-8"));
    } catch {}
    return { props: { productData, collections, blogPosts, videos } };
  } catch (e) {
    return { props: { productData: [], collections: [], blogPosts: [], videos: [] } };
  }
};
