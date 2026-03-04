import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { StateProps, StoreProduct } from "../../type";
import FavoriteProduct from "@/components/FavoriteProduct";
import ResetFavoriteItems from "@/components/ResetFavoriteItems";
import Link from "next/link";
import { addToCart } from "@/store/nextSlice";

const FavoritePage = () => {
  const dispatch = useDispatch();
  const { favoriteData } = useSelector((state: StateProps) => state.next);
  const total = favoriteData.reduce((sum: number, p: StoreProduct) => sum + (p.price || 0), 0);

  return (
    <div className="max-w-screen-xl mx-auto px-6 gap-10 py-4">
      {favoriteData.length > 0 ? (
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-center justify-between border-b-[1px] border-b-gray-400 pb-1">
            <p className="text-2xl font-semibold text-amazon_blue">
              Mis favoritos ({favoriteData.length})
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  favoriteData.forEach((item: StoreProduct) => {
                    dispatch(addToCart({
                      _id: item._id,
                      brand: item.brand,
                      category: item.category,
                      description: item.description,
                      image: item.image,
                      isNew: item.isNew,
                      oldPrice: item.oldPrice,
                      price: item.price,
                      title: item.title,
                      quantity: 1,
                    }));
                  });
                }}
                className="h-10 px-4 font-semibold bg-amazon_blue text-white rounded-lg hover:bg-amazon_yellow hover:text-black duration-300"
              >
                Agregar todos al carrito
              </button>
              <ResetFavoriteItems />
            </div>
          </div>
          <div>
            {favoriteData.map((item: StoreProduct) => (
              <div key={item._id} className="mt-2">
                <FavoriteProduct item={item} />
              </div>
            ))}
            <div className="mt-3 text-sm text-gray-700">Total referencial: S/ {total}</div>
          </div>
        </div>
      ) : (
        <div className="bg-white h-96 flex flex-col items-center justify-center py-5 rounded-lg shadow-lg">
          <h1 className="text-lg font-semibold">Aún no tienes favoritos</h1>
          <p className="text-sm text-gray-600 mt-1">Marca con el corazón los productos que te interesen.</p>
          <div className="mt-3 flex items-center gap-2">
            <Link href="/" className="w-40 h-10 bg-amazon_blue text-white rounded-lg text-sm font-semibold hover:bg-amazon_yellow hover:text-black duration-300 flex items-center justify-center">Ir al catálogo</Link>
            <Link href="/categoria/resina" className="w-40 h-10 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 duration-300 flex items-center justify-center">Ver resinas</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
