import React from "react";
import Image from "next/image";
import FormattedPrice from "./FormattedPrice";

import { ProductProps } from "../../type";
type Item = {
  item: ProductProps;
};

const SearchProducts = ({ item }: Item) => {
  const normImg = (s?: string) => {
    const t = String(s || "");
    if (!t) return "/favicon-96x96.png";
    let u = t.replace(/\\/g, "/");
    if (/^https?:\/\//i.test(u)) return u;
    if (!u.startsWith("/")) u = "/" + u;
    return u;
  };
  return (
    <div className="flex items-center gap-4">
      <Image className="w-24 h-24 object-cover rounded" src={normImg(item.image)} alt="productImage" width={96} height={96} />
      <div>
        <p className="text-xs -mb-1">
          {item.brand}_{item.category}
        </p>
        <p className="text-lg font-medium">{item.title}</p>
        <p className="text-xs">{item.description.substring(0, 100)}</p>
        <p className="text-sm flex items-center gap-1">
          Precio:{" "}
          <span className="font-semibold">
            <FormattedPrice amount={item.price} />
          </span>
          {typeof item.oldPrice === "number" && item.oldPrice > item.price && (
            <span className="text-gray-600 line-through">
              <FormattedPrice amount={item.oldPrice} />
            </span>
          )}
        </p>
      </div>
      <div className="flex-1 text-right px-4">
        {typeof item.oldPrice === "number" && item.oldPrice > item.price && (
          <p className="text-base font-semibold animate-bounce text-amazon_blue">
            Ahorra <FormattedPrice amount={item.oldPrice - item.price} />
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchProducts;
