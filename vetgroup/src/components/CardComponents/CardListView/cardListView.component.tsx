"use client";

import { useEffect, useState } from "react";
import { useCart, useCard, useCardView, HistoryCardState } from "@/store/store";
import TrashSVG from "../../Elements/Icons/TrashSVG";
import style from "./cardListView.module.scss";
import { CardView, ProductType } from "@/utils/Types";
import { getCookie } from "@/utils/cookies";
import { add_order } from "@/utils/query";
import { Item } from "@/classes/ItemClass";
import Cookies from "js-cookie";
import { add_strapi_order } from "@/utils/query";
import { updateProductStock } from "@/utils/query";
import ArrowSVG from "@/components/Elements/Icons/ArrowSVG";
import ImageComponent from "@/components/Elements/Image/image.component";
import { get_product_by_id } from "@/utils/query";

/** ===== Types ===== */

type OrderProductType = {
  ItemsList: Array<{
    ItemID: string;
    Quantity: number;
  }>;
};

type VisibleItems = ProductType[] | OrderProductType;

type OneCOrderResponse = {
  ItemsToProvide?: Array<{ ItemCode: string; Quantity: number }>;
};

type GetByIdReturn = ProductType | { products: ProductType[] };

/** ===== Type Guards & Helpers (module scope) ===== */

const isOrder = (v: unknown): v is OrderProductType =>
  !!v &&
  typeof v === "object" &&
  Array.isArray((v as OrderProductType).ItemsList);

const hasProductsArray = (r: GetByIdReturn): r is { products: ProductType[] } =>
  r != null && typeof r === "object" && "products" in r;

const normalize = (r: GetByIdReturn): ProductType | null => {
  if (hasProductsArray(r)) {
    const arr = r.products;
    return Array.isArray(arr) ? arr[0] ?? null : null;
  }
  return r as ProductType;
};

/** ===== Caches to avoid duplicate network calls in React Strict Mode =====
 *  - productCache: per ItemID result
 *  - batchCache: per batch key (joined ids) result array
 *  - inFlight: coalesce concurrent requests for the same batch
 */
const productCache = new Map<string, ProductType>();
const batchCache = new Map<string, ProductType[]>();
const inFlight = new Map<string, Promise<ProductType[]>>();

async function getProductsByIds(ids: string[]): Promise<ProductType[]> {
  // Use a stable key for the batch; keep order stable
  const batchKey = ids.join("|");

  // If we already have the full batch cached, return it
  const cachedBatch = batchCache.get(batchKey);
  if (cachedBatch) return cachedBatch;

  // If there is a request in-flight for this exact batch, await it
  const inflight = inFlight.get(batchKey);
  if (inflight) return inflight;

  // Otherwise build a new request, reusing any item-level cache entries
  const req = Promise.all(
    ids.map(async (id) => {
      const cached = productCache.get(String(id));
      if (cached) return cached;
      const res = await get_product_by_id(id);
      const prod = normalize(res);
      if (prod) productCache.set(String(id), prod);
      return prod ?? ({} as ProductType); // fallback to keep array shape
    })
  )
    .then((arr) => {
      // Ensure order aligns with ids
      const result = arr as ProductType[];
      batchCache.set(batchKey, result);
      inFlight.delete(batchKey);
      return result;
    })
    .catch((e) => {
      inFlight.delete(batchKey);
      throw e;
    });

  inFlight.set(batchKey, req);
  return req;
}

export default function CardListView() {
  const {
    cartItems,
    removeItem,
    cartTotal,
    addItem,
    updateQty,
    updateCart,
    cleanCart,
  } = useCart();
  const { setCardState } = useCard();
  const { cardViewState } = useCardView();
  const { currentHistoryItem } = HistoryCardState();

  const [messageCard, setMessageCard] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jwt, setJwt] = useState<string | undefined>();
  const [isClient, setIsClient] = useState(false);

  // Products resolved for the History view (non-array branch)
  const [resolvedItems, setResolvedItems] = useState<ProductType[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setJwt(Cookies.get("jwt"));

    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as ProductType[];
        const restoredCart = parsedCart.map(
          (item: ProductType) => new Item(item, item.qty)
        );
        restoredCart.forEach((item: Item) => addItem(item));
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
  }, [addItem]);

  const toLoginPage = () => {
    window.location.href = "/login";
  };

  const save_request = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const user = getCookie("code");
      const id = getCookie("user");
      if (!user) throw new Error("User not found");

      let result1C: OneCOrderResponse | null = null;
      let itemsToRemove: { ItemCode: string; Quantity: number }[] = [];
      let notFull = false;
      let complited = false;

      try {
        result1C = await add_order(cartItems, user);
        itemsToRemove = result1C?.ItemsToProvide ?? [];
        notFull = itemsToRemove.length !== 0;
        complited = true;
      } catch {
        console.warn("1C API failed, proceeding to save order locally");
        complited = false;
      }

      const updatedCartItems = cartItems
        .map((item) => {
          const missing = itemsToRemove.find(
            (p) => p.ItemCode === item.backendId
          );
          const newQty = missing ? item.qty - missing.Quantity : item.qty;
          return newQty > 0 ? new Item(item, newQty) : null;
        })
        .filter((item): item is Item => item !== null);

      updateCart(updatedCartItems);

      const freshTotal = useCart.getState().cartTotal;
      if (updatedCartItems.length === 0) {
        setMessageCard(true);
      }

      if (id) {
        await add_strapi_order(
          updatedCartItems,
          freshTotal,
          id,
          complited,
          user
        );

        const updateResults = await Promise.all(
          updatedCartItems.map((item) =>
            updateProductStock(item.code, item.qty)
          )
        );
        const allUpdated = updateResults.every((res) => res === true);

        cleanCart();
        setMessageCard(true);

        if (notFull) {
          setMessage("Ցավում ենք, որոշ ապրանքներն այս պահին հասանելի չեն։");
        } else {
          setMessage("Պատվերը հաջողությամբ ուղարկվեց։");
        }

        if (!allUpdated) {
          setMessage("Պատվերը պահվեց, բայց պահեստի տվյալները չեն թարմացվել։");
        }
      }
    } catch {
      setMessageCard(true);
      setMessage("Տեխնիկական խնդիր։");
    } finally {
      setTimeout(() => {
        setMessageCard(false);
        setCardState(false);
        setIsLoading(false);
      }, 1500);
      setTimeout(() => {
        // window.location.reload();
      }, 500);
    }
  };

  const formatPrice = (value: number): string => {
    if (isNaN(value)) return "0";
    const fixed = value.toFixed(2);
    const [intPart, decimal] = fixed.split(".");
    let formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (decimal !== "00") formatted += "," + decimal;
    return formatted;
  };

  const visibleItems: VisibleItems =
    cardViewState === CardView.History ? currentHistoryItem : cartItems;

  // Fetch products for history (non-array) branch; keep order aligned with ItemsList
  useEffect(() => {
    if (isOrder(visibleItems)) {
      setHistoryLoading(true);
      const ids = visibleItems.ItemsList.map((x) => x.ItemID);

      getProductsByIds(ids)
        .then((normalized) => {
          setResolvedItems(normalized);
        })
        .catch((err) => {
          console.error("Failed to load products", err);
          setResolvedItems([]);
        })
        .finally(() => setHistoryLoading(false));
    } else {
      // clear when leaving history view
      setResolvedItems([]);
      setHistoryLoading(false);
    }
  }, [visibleItems]);

  const isHistory = cardViewState === CardView.History;

  return (
    <>
      <div className={style.cardList}>
        <div className={`${style.cardListRow} flex row`}>
          {!isHistory && (
            <div className={style.cardListRowTitle}>
              <span>Նկար</span>
            </div>
          )}
          <div className={style.cardListRowTitle}>
            <span>Անվանում</span>
          </div>
          <div className={style.cardListRowTitle}>
            <span>Քանակ</span>
          </div>
          {!isHistory && (
            <div className={style.cardListRowTitle}>
              <span>Գին</span>
            </div>
          )}
          <div className={style.cardListRowTitle}>
            <span>Ընդհանուր</span>
          </div>
        </div>

        <div className={style.cardListData}>
          {isOrder(visibleItems) ? (
            historyLoading ? (
              <div className={style.cardListDataRow}>
                <span>Բեռնվում է...</span>
              </div>
            ) : (
              resolvedItems.map((item, idx) => {
                const qty = visibleItems.ItemsList[idx]?.Quantity ?? 0;
                return (
                  <div
                    className={`row flex ${style.cardListDataRow}`}
                    key={item.code ?? idx}
                  >
                    <div className={style.cardListDataRowElement}>
                      <span>{item.description}</span>
                    </div>
                    <div className={style.cardListDataRowElement}>
                      <span>{qty}</span>
                    </div>
                    <div className={`${style.cardListDataRowElement} flex`}>
                      <span>{formatPrice((item.price ?? 0) * qty)} Դրամ</span>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // ProductType[] branch
            (visibleItems as ProductType[]).map((item, key) => {
              const imageUrl = item?.image?.url
                ? `https://vetgroup.am${item.image.url}`
                : "";
              return (
                <div
                  className={`row flex ${style.cardListDataRow}`}
                  key={item.code ?? key}
                >
                  {!isHistory && (
                    <div className={style.cardListDataRowElement}>
                      <div className={style.cardListDataRowElementImage}>
                        <ImageComponent
                          url={imageUrl}
                          alt={item.description ?? ""}
                        />
                      </div>
                    </div>
                  )}

                  <div className={style.cardListDataRowElement}>
                    <span>{item.description}</span>
                  </div>

                  <div className={style.cardListDataRowElement}>
                    {!isHistory ? (
                      <div className={style.qtyControls}>
                        <button
                          onClick={() =>
                            updateQty(
                              item.code,
                              Math.max(1, (item.qty ?? 1) - 1)
                            )
                          }
                          disabled={isHistory}
                        >
                          <ArrowSVG />
                        </button>
                        <input
                          type="number"
                          value={item.qty ?? 1}
                          onChange={(e) =>
                            updateQty(item.code, Number(e.target.value) || 1)
                          }
                          disabled={isHistory}
                          min={1}
                          inputMode="numeric"
                        />
                        <button
                          onClick={() =>
                            updateQty(item.code, (item.qty ?? 1) + 1)
                          }
                          disabled={isHistory}
                        >
                          <ArrowSVG />
                        </button>
                      </div>
                    ) : (
                      <span>{item.qty}</span>
                    )}
                  </div>

                  {!isHistory && (
                    <div className={style.cardListDataRowElement}>
                      <span>{formatPrice(item.price ?? 0)} Դրամ</span>
                    </div>
                  )}

                  <div className={`${style.cardListDataRowElement} flex`}>
                    <span>
                      {formatPrice((item.price ?? 0) * (item.qty ?? 1))} Դրամ
                    </span>
                    {!isHistory && (
                      <button
                        onClick={() =>
                          removeItem((item as unknown as Item).getId())
                        }
                      >
                        <TrashSVG />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {!isHistory && (
        <div className={style.cardListCheckout}>
          <h1>
            Ընդհանուր: <span>{formatPrice(cartTotal)} Դրամ</span>
          </h1>
          {isClient && jwt ? (
            <button
              onClick={save_request}
              className={
                isLoading ||
                (Array.isArray(visibleItems) && visibleItems.length <= 0)
                  ? style.disabled
                  : ""
              }
              disabled={
                isLoading ||
                (Array.isArray(visibleItems) && visibleItems.length <= 0)
              }
            >
              {isLoading ? "Ուղարկում է..." : "Ուղարկել Պատվերը"}
            </button>
          ) : (
            isClient && <button onClick={toLoginPage}>Login</button>
          )}
        </div>
      )}

      {messageCard && <div className={style.message}>{message}</div>}
    </>
  );
}
