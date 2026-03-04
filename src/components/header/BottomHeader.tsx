import { LuMenu } from "react-icons/lu";
import { StateProps } from "../../../type";
import { signOut } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "@/store/nextSlice";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BottomHeader = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: StateProps) => state.next);
  const handleSignOut = () => {
    signOut();
    dispatch(removeUser());
  };
  const [open, setOpen] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mega = [
    { title: "Moldes de silicona", slug: "moldes-de-silicona", items: ["Redondos", "Rectangulares", "Geométricos", "Letras y números", "Personalizados"] },
    { title: "Pigmentos", slug: "pigmentos", items: ["Líquidos", "En polvo", "Glitter", "Perlado"] },
    { title: "Accesorios", slug: "accesorios", items: ["Herramientas", "Bases", "Cadenas", "Anillas"] },
    { title: "Resina", slug: "resina", items: ["Epoxi", "UV", "Catalizador"] },
    { title: "Creaciones", slug: "creaciones", items: ["Joyas", "Llaveros", "Decoración", "Arte"] },
    { title: "Talleres", slug: "talleres", items: ["Principiantes", "Avanzados", "Fechas"] },
  ];
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = menuRef.current;
      if ((open || openMobile) && el && !el.contains(e.target as Node)) {
        setOpen(false);
        setOpenMobile(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, openMobile]);

  return (
    <div ref={menuRef} className="w-full h-12 bg-white text-sm text-gray-700 px-4 flex items-center relative border-b border-gray-200">
      <button onClick={() => { setOpen((v) => !v); setOpenMobile(false); }} className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200 hover:border-amazon_blue">
        <LuMenu className="text-lg" /> Ver categorías
      </button>
      <button onClick={() => { setOpenMobile(true); setOpen(false); }} className="md:hidden flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200">
        <LuMenu className="text-lg" /> Menú
      </button>
      {open && (
        <div className="absolute top-12 left-0 right-0 bg-white text-black shadow-xl z-50 border-t border-gray-200" onMouseLeave={() => setOpen(false)}>
          <div className="max-w-screen-2xl mx-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mega.map((col) => (
              <div key={col.slug}>
                <Link href={`/categoria/${col.slug}`} className="font-semibold px-2 py-1 rounded hover:bg-gray-100 inline-block">
                  {col.title}
                </Link>
                <ul className="mt-2 text-sm text-gray-700 grid gap-1">
                  {col.items.map((it) => (
                    <li key={it}>
                      <Link href={`/categoria/${col.slug}`} className="px-2 py-1 rounded hover:bg-gray-100 inline-block" onClick={() => setOpen(false)}>
                        {it}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-amazon_blue rounded-md p-6 text-white flex flex-col justify-center">
              <p className="text-lg font-semibold">Descubre nuevas resinas</p>
              <p className="text-sm opacity-90">Ofertas y novedades de la semana</p>
              <Link href="/categoria/resina" className="mt-4 inline-block px-4 py-2 rounded-md bg-white text-amazon_blue hover:brightness-95" onClick={() => setOpen(false)}>
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:flex items-center gap-6 ml-6">
        <Link href="/" className="inline-flex items-center h-9">Inicio</Link>
        <Link href="/productos" className="inline-flex items-center h-9">Productos</Link>
        <Link href="/blog" className="inline-flex items-center h-9">Blog</Link>
        <Link href="/categoria/talleres" className="inline-flex items-center h-9">Capacitaciones</Link>
      </div>

      <div className="ml-auto hidden md:flex items-center gap-2 text-amazon_blue">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-amazon_blue">%</span>
          Descuento en tu primera compra
        </span>
      </div>

      {userInfo && (
        <button
          onClick={handleSignOut}
          className="hidden md:inline-flex items-center h-9 px-2 text-amazon_blue cursor-pointer duration-300"
        >
          Cerrar sesión
        </button>
      )}

      {openMobile && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenMobile(false)} />
          <div className="absolute left-0 top-0 h-full w-full max-w-sm bg-white text-black shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold">Categorías</span>
              <button onClick={() => setOpenMobile(false)} className="text-gray-500 hover:text-gray-800" aria-label="Cerrar">
                ✕
              </button>
            </div>
            <div className="grid gap-3">
              {mega.map((col) => (
                <div key={col.slug} className="border border-gray-200 rounded-lg">
                  <Link href={`/categoria/${col.slug}`} className="block px-3 py-2 font-semibold bg-gray-50" onClick={() => setOpenMobile(false)}>
                    {col.title}
                  </Link>
                  <ul className="text-sm">
                    {col.items.map((it) => (
                      <li key={it}>
                        <Link href={`/categoria/${col.slug}`} className="block px-3 py-2 hover:bg-gray-100" onClick={() => setOpenMobile(false)}>
                          {it}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <span className="text-base font-semibold">Accesos rápidos</span>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link href="/" className="px-3 py-2 text-sm border rounded" onClick={() => setOpenMobile(false)}>Inicio</Link>
                <Link href="/productos" className="px-3 py-2 text-sm border rounded" onClick={() => setOpenMobile(false)}>Productos</Link>
                <Link href="/blog" className="px-3 py-2 text-sm border rounded" onClick={() => setOpenMobile(false)}>Blog</Link>
                <Link href="/categoria/talleres" className="px-3 py-2 text-sm border rounded" onClick={() => setOpenMobile(false)}>Capacitaciones</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomHeader;
