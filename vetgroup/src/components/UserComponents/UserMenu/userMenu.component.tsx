"use client";
import style from "./userMenu.module.scss";
import Avatar from "../../Elements/Icons/AvatarSVG";
import LogoSVG from "@/components/Elements/Icons/LogoSVG";
import HamburgerSVG from "@/components/Elements/Icons/HamburgerSVG";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { get_categories, get_products } from "@/utils/query";
import { productsStore } from "@/store/store";
import { useRouter } from "next/navigation";
type Category = { title: string };

export default function UserMenu() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [hamburger, setHamburger] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [jwt, setJwt] = useState<string | undefined>();

  const selectedCategory = productsStore(
    (state) => state.selectedCategories[0]
  );

  useEffect(() => {
    setIsClient(true);
    setJwt(Cookies.get("jwt"));
    get_categories().then((data) => {
      if (data?.categories) {
        setCategories(data.categories);
      }
    });
  }, []);

  const categoryPosts = async (cat: string) => {
    setHamburger(false);

    const store = productsStore.getState();
    const { categorizedProducts, selectedCategories } = store;
    const selectedCategory = selectedCategories[0];

    if (selectedCategory === cat) return;

    store.setSelectedCategory(cat);
    store.resetCategorizedProducts();
    store.setCategorizedStart(cat, 0);
    store.setLoading(true);

    setTimeout(() => {
      const scrollElement =
        document.scrollingElement || document.documentElement;
      scrollElement.scrollTo({ top: 0, behavior: "auto" });

      setTimeout(() => {
        scrollElement.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }, 0);

    const isAlreadyFetched = categorizedProducts.some(
      (item) => item.cat === cat
    );

    if (!isAlreadyFetched) {
      try {
        const data = await get_products(0, 18, cat);
        if (data?.products) {
          store.addCategorizedProducts(cat, data.products);
          store.setCategorizedStart(cat, 18);
        }
      } finally {
        store.setLoading(false);
      }
    } else {
      store.setLoading(false);
    }
  };

  const cleanFilters = () => {
    const store = productsStore.getState();
    store.resetSelectedCategories();
    store.resetCategorizedProducts();
    store.setCurrentStart(0);
    router.push("/");
  };

  return (
    <div className={`${style.userMenu} flex`}>
      <div className={style.userMenuLogo} onClick={cleanFilters}>
        <Link href="/" onClick={cleanFilters}>
          <LogoSVG />
        </Link>
      </div>

      <div className={`${style.userMenuCategories} ${style.scrollable}`}>
        {categories.map((cat, key) => (
          <button
            key={key}
            onClick={() => categoryPosts(cat.title)}
            className={selectedCategory === cat.title ? style.active : ""}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <div className={style.userMenuAvatar}>
        {isClient && (
          <Link href={jwt ? "/user" : "/login"}>
            <Avatar />
          </Link>
        )}
        <div className={style.userMenuHamburger}>
          <div className="row">
            <button onClick={() => setHamburger(!hamburger)}>
              <HamburgerSVG />
            </button>
          </div>
          <div className="row" />
        </div>
      </div>

      {hamburger && (
        <div className={style.cat_hamburger_container}>
          <div className={style.cat_hamburger_container_buttons}>
            {categories.map((cat, key) => (
              <button
                key={key}
                onClick={() => categoryPosts(cat.title)}
                className={selectedCategory === cat.title ? style.active : ""}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
