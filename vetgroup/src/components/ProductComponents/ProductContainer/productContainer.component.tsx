"use client";

import style from "./productContainer.module.scss";
import Cookies from "js-cookie";

import { useCart, useCard, useCardView, productsStore } from "@/store/store";
import Product from "../Product/product.component";
import SearchBar from "@/components/Elements/SearchBar/searchBar.component";
import CartSVG from "@/components/Elements/Icons/CartSVG";
import { CardView, ProductType } from "@/utils/Types";
import { useEffect, useState, useRef, useCallback } from "react";
import { get_search_fragments, get_products } from "@/utils/query";

export default function ProductContainer() {
  const { getItemCount, cartTotal } = useCart();
  const { setCardState } = useCard();
  const { setCardView } = useCardView();
  const {
    products,
    categorizedProducts,
    searchQuery,
    loading,
    selectedCategories,
  } = productsStore();
  const [company, setCompany] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const cookieValue = Cookies.get("company");
    setCompany(cookieValue || null);
    setHasMounted(true);
  }, []);
  const selectedCategory = selectedCategories[0];
  const [visibleProducts, setVisibleProducts] = useState<ProductType[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedRef = useRef<{ [cat: string]: boolean }>({});
  const fetchData = useCallback(async () => {
    const store = productsStore.getState();
    const limit = 18;
    const start = selectedCategory
      ? store.categorizedStart[selectedCategory] || 0
      : store.currentStart;

    const data = await get_products(start, limit, selectedCategory);

    if (data?.products?.length > 0) {
      if (selectedCategory) {
        if (!hasLoadedRef.current[selectedCategory]) {
          store.clearCategorizedProducts(selectedCategory);
          hasLoadedRef.current[selectedCategory] = true;
        }

        store.addCategorizedProducts(selectedCategory, data.products);
        store.setCategorizedStart(selectedCategory, start + limit);
      } else {
        store.add_product(data.products);
        store.setCurrentStart(start + limit);
      }
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData(); // Initial fetch
  }, [fetchData]);

  useEffect(() => {
    const sourceProducts =
      selectedCategories.length > 0
        ? categorizedProducts
            .filter((catObj) => selectedCategories.includes(catObj.cat))
            .flatMap((catObj) => catObj.cat_prods)
        : products;

    if (products.length > 0) {
      setInitialLoad(false);
      setVisibleProducts(sourceProducts);
      setHasInitialized(true);
    }
  }, [products, categorizedProducts, selectedCategories]);

  useEffect(() => {
    if (!hasInitialized || loading) return;

    const query = searchQuery.trim();
    const words = query.split(/\s+/).filter(Boolean);
    const normalize = (s: string) => s.toLocaleLowerCase("hy-AM");

    const sourceProducts =
      selectedCategories.length > 0
        ? categorizedProducts
            .filter((catObj) => selectedCategories.includes(catObj.cat))
            .flatMap((catObj) => catObj.cat_prods)
        : products;

    if (query.length > 0) {
      const localMatches = sourceProducts.filter((product) => {
        const name = normalize(product.name);
        const description = normalize(product.description);
        return words.every((word) => {
          const w = normalize(word);
          return name.includes(w) || description.includes(w);
        });
      });
      setVisibleProducts(localMatches);
    }

    const delayDebounce = setTimeout(async () => {
      if (query.length >= 1) {
        const data = await get_search_fragments(query);
        if (data?.products) {
          setVisibleProducts(data.products);
        }
      } else {
        setVisibleProducts(sourceProducts);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [
    searchQuery,
    products,
    categorizedProducts,
    selectedCategories,
    hasInitialized,
    loading,
  ]);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          fetchData();
        }
      },
      {
        root: null,
        threshold: 0.4,
      }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [fetchData, loading]);

  const showCart = () => {
    setCardState(true);
    setCardView(CardView.List);
  };

  const placeholderData: ProductType = {
    code: "0000",
    stock: 1000,
    name: "L. Ipsume",
    description: "Lorem Ipsum",
    pack_price: 1500,
    price: 1000,
    image: { url: "" },
    backendId: null,
    __typename: "Product",
    qty: 1,
    totalPrice: 1,
    category: { title: "" },
  };

  return (
    <div className={style.mainContainer}>
      <div className={`${style.mainContainerSearchBar} flex`}>
        <SearchBar />
        <div className={style.mainContainerSearchBarCart}>
          <button
            className={style.mainContainerSearchBarCartButton}
            onClick={showCart}
          >
            {getItemCount() > 0 && (
              <div className={style.mainContainerSearchBarCartButtonItems}>
                {cartTotal}
              </div>
            )}
            <CartSVG />
          </button>
        </div>
        {hasMounted && company && company !== "null" && (
          <div className={style.company}>
            <p>
              Ողջույն, <span>{company}</span>
            </p>
          </div>
        )}
      </div>

      <div className={`${style.mainContainerProductContainer} flex`}>
        {(initialLoad || loading) && visibleProducts.length === 0
          ? Array.from({ length: 10 }).map((_, index) => (
              <Product
                key={`placeholder-${index}`}
                data={placeholderData}
                placeholder
              />
            ))
          : visibleProducts.map((product, i) => (
              <Product
                key={product.code + i}
                data={product}
                placeholder={false}
              />
            ))}
        <div ref={observerRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}
