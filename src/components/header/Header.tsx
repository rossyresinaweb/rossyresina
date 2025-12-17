import Image from "next/image";
import logo from "../../images/logo.jpg";
import cartIcon from "@/images/cartlcon.png";
import { BiCaretDown } from "react-icons/bi";
import { HiOutlineSearch } from "react-icons/hi";
import { SlLocationPin } from "react-icons/sl";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { StateProps, StoreProduct } from "../../../type";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { addUser, deleteProduct } from "@/store/nextSlice";
import SearchProducts from "../SearchProducts";
import { IoMdClose } from "react-icons/io";
import FormattedPrice from "@/components/FormattedPrice";
const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [allData, setAllData] = useState([]);
  const peruCities = [
    "Lima","Arequipa","Trujillo","Chiclayo","Piura","Cusco","Iquitos","Huancayo","Tacna","Chimbote","Pucallpa","Juliaca","Sullana","Huánuco","Ayacucho","Tarapoto","Cajamarca","Tumbes","Huaraz","Moquegua","Ica","Puno","Callao","Nasca","Chincha","Pisco","Lambayeque","Abancay","Bagua","Jaén"
  ];
  const [selectedCity, setSelectedCity] = useState<string>("Lima");
  
  useEffect(() => {}, []);
  const { productData, favoriteData, userInfo, allProducts } = useSelector(
    (state: StateProps) => state.next
  );
  const dispatch = useDispatch();
  useEffect(() => {
    setAllData(allProducts.allProducts);
  }, [allProducts]);
  useEffect(() => {
    if (session) {
      dispatch(
        addUser({
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        })
      );
    }
  }, [session, dispatch]);

  // Search area
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [openCategories, setOpenCategories] = useState(false);
  const [openCartDropdown, setOpenCartDropdown] = useState(false);
  const catLinks = [
    { slug: "moldes-de-silicona", label: "Moldes de silicona" },
    { slug: "pigmentos", label: "Pigmentos" },
    { slug: "accesorios", label: "Accesorios" },
    { slug: "resina", label: "Resina" },
    { slug: "creaciones", label: "Creaciones" },
    { slug: "talleres", label: "Talleres" },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const filtered = allData.filter((item: StoreProduct) =>
      item.title.toLocaleLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, allData]);

  useEffect(() => {
    const handleRouteChange = () => setOpenCartDropdown(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  return (
    <div className="w-full h-20 bg-gradient-to-r from-brand_purple via-brand_pink to-brand_teal text-lightText sticky top-0 z-50">
      <div className="h-full w-full mx-auto inline-flex items-center justify-center gap-6 px-4">
        {/* logo */}
        <Link
          href={"/"}
          className="px-2 cursor-pointer duration-300 flex items-center justify-center h-[70%]"
        >
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-1 shadow-md ring-2 ring-white/60">
              <Image className="h-10 w-10 object-contain rounded-full" src={logo} alt="Logo Rossy Resina" priority />
            </div>
            <span className="mt-1 text-white font-semibold">Rossy Resina</span>
          </div>
        </Link>
        {/* serchbar */}
        <div className="hidden md:flex items-center gap-5">
          <div className="md:w-[520px] lg:w-[560px] h-9 hidden md:inline-flex items-center justify-between relative">
          <input
            onChange={handleSearch}
            value={searchQuery}
            className="w-full h-full rounded-full pl-20 pr-24 placeholder:text-xs text-sm text-black border-[2px] border-transparent outline-none focus-visible:border-amazon_yellow"
            type="text"
            placeholder="Buscar artículo..."
          />
          <button
            onClick={() => setOpenCategories((v) => !v)}
            className="absolute left-0 top-0 h-full w-20 bg-gray-100 text-black text-xs rounded-full flex items-center justify-center gap-1 px-2 hover:bg-gray-200"
          >
            Todos <BiCaretDown />
          </button>
          <button className="absolute right-0 top-0 h-full px-4 rounded-full bg-amazon_blue text-white text-sm font-semibold hover:bg-amazon_yellow hover:text-black">Buscar</button>
          {openCategories && (
            <div className="absolute left-0 top-12 bg-white text-black rounded-md shadow-lg grid grid-cols-1 md:grid-cols-2 gap-2 p-3 z-50">
              {catLinks.map((c) => (
                <Link key={c.slug} href={`/categoria/${c.slug}`} className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => setOpenCategories(false)}>
                  {c.label}
                </Link>
              ))}
            </div>
          )}
          {/* ========== Searchfield ========== */}
          {searchQuery && (
            <div className="absolute left-0 top-12 w-full mx-auto max-h-96 bg-gray-200 rounded-lg overflow-y-scroll cursor-pointer text-black">
              {filteredProducts.length > 0 ? (
                <>
                  {searchQuery &&
                    filteredProducts.map((item: StoreProduct) => (
                      <Link
                        key={item._id}
                        className="w-full border-b-[1px] border-b-gray-400 flex items-center gap-4"
                        href={{
                          pathname: `${item._id}`,
                          query: {
                            _id: item._id,
                            brand: item.brand,
                            category: item.category,
                            description: item.description,
                            image: item.image,
                            isNew: item.isNew,
                            oldPrice: item.oldPrice,
                            price: item.price,
                            title: item.title,
                          },
                        }}
                        onClick={() => setSearchQuery("")}
                      >
                        <SearchProducts item={item} />
                      </Link>
                    ))}
                </>
              ) : (
                <div className="bg-gray-50 flex items-center justify-center py-10 rounded-lg shadow-lg">
                  <p className="text-xl font-semibold animate-bounce">
                    No hay coincidencias con tu búsqueda. Inténtalo de nuevo.
                  </p>
                </div>
              )}
            </div>
          )}
          {/* ========== Searchfield ========== */}
          </div>
          <Link
            href={userInfo ? "/account" : "/sign-in"}
            className="ml-2 inline-flex items-center h-8 px-4 rounded-full bg-white text-amazon_blue hover:bg-amazon_yellow hover:text-black text-sm font-semibold"
          >
            Cuenta
          </Link>
        </div>
        
        {/* cart with dropdown */}
        <div
          className="px-2 cursor-pointer duration-300 h-[70%] relative flex items-center"
          onMouseEnter={() => {
            if (productData.length) {
              setOpenCategories(false);
              setOpenCartDropdown(true);
            }
          }}
          onMouseLeave={() => setOpenCartDropdown(false)}
        >
          <Link href={"/cart"} className="flex items-center relative">
            <Image
              className="h-10 w-10 object-contain"
              src={cartIcon}
              alt="carrito"
            />
            <p className="text-xs text-white font-bold mt-3 hidden sm:block">Carrito</p>
            <span className="absolute text-amazon_yellow text-sm top-2 left-[36px] font-semibold">
              {productData ? productData.length : 0}
            </span>
          </Link>
          {productData.length > 0 && openCartDropdown && (
            <div className="absolute right-0 top-12 bg-white text-black rounded-md shadow-lg w-80 z-50">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold">Resumen del carrito</span>
                <Link href="/cart" className="text-xs text-amazon_blue hover:underline" onClick={() => setOpenCartDropdown(false)}>Ver todo</Link>
              </div>
              <div className="max-h-64 overflow-y-auto p-3 grid gap-3">
                {productData.slice(0, 4).map((item: StoreProduct) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <Image src={((): string => { const s = String(item.image || ""); let u = s.replace(/\\/g, "/"); if (/^https?:\/\//i.test(u)) return u; return u ? (u.startsWith("/") ? u : "/" + u) : "/favicon-96x96.png"; })()} alt={item.title} width={48} height={48} className="rounded object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-600">x{item.quantity} · <span className="text-amazon_blue font-semibold"><FormattedPrice amount={item.price * item.quantity} /></span></p>
                    </div>
                    <button
                      onClick={() => dispatch(deleteProduct(item._id))}
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Eliminar"
                    >
                      <IoMdClose />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-semibold text-amazon_blue">
                  <FormattedPrice amount={productData.reduce((s: number, p: any) => s + p.price * p.quantity, 0)} />
                </span>
              </div>
              <div className="p-3">
                <Link href="/checkout" className="block w-full text-center px-3 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black" onClick={() => setOpenCartDropdown(false)}>Checkout</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
