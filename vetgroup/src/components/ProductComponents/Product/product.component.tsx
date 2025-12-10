"use client";
import style from "./product.module.scss";
import { useEffect, useState } from "react";
import { useCart } from "@/store/store";
import { ProductPropsInterface } from "@/utils/Interfaces";
import { Item } from "@/classes/ItemClass";

import ImageComponent from "@/components/Elements/Image/image.component";
import ArrowSVG from "@/components/Elements/Icons/ArrowSVG";
import Cookies from "js-cookie";

export default function Product({ data, placeholder }: ProductPropsInterface) {
  const [quantity, setQuantity] = useState(1);
  const [jwt, setJwt] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState(quantity.toString());

  const { addItem } = useCart();
  const [currentProduct, setCurrentProduct] = useState(new Item(data, 1));
  useEffect(() => {
    setJwt(Cookies.get("jwt"));
  }, []);
  const increment = (product: Item) => {
    if (quantity < product.getStock()) {
      product.setQty(quantity + 1);
      setQuantity(product.getQty());
      setInputValue(product.getQty().toString());
      setCurrentProduct(product);
    }
  };

  const decrement = (product: Item) => {
    if (quantity > 1) {
      product.setQty(quantity - 1);
      setQuantity(product.getQty());
      setInputValue(product.getQty().toString());
      setCurrentProduct(product);
    }
  };
  const handleBlur = () => {
    let num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > currentProduct.getStock()) num = currentProduct.getStock();

    setQuantity(num);
    setInputValue(num.toString());
    currentProduct.setQty(num);
    setCurrentProduct(currentProduct);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= currentProduct.getStock()) {
      setQuantity(num);
      currentProduct.setQty(num);
      setCurrentProduct(currentProduct);
    }
  };

  const orderItem = (): void => {
    if (!jwt) {
      window.location.href = "/login";
    } else {
      currentProduct.setTotal();
      addItem(currentProduct);
    }
  };
  const imageUrl = currentProduct?.getImage();
  const fullImageUrl = imageUrl
    ? `https://vetgroup.am${imageUrl}`
    : "/placeholder.webp";
  if (currentProduct.getPrice() <= 0) return;
  return (
    <section
      className={`${style.product} flex ${
        placeholder ? style.placeholder : ""
      }`}
    >
      <div className={style.productImage}>
        <ImageComponent
          alt={currentProduct?.getTitle() || ""}
          url={fullImageUrl}
        />
      </div>

      <div className={`${style.productInfo} flex`}>
        <div className={`${style.productInfoPrice}`}>
          {jwt ? (
            <>
              <p className={style.productInfoPriceSale}>
                Մեծածախ{" "}
                {currentProduct.formatPrice(
                  currentProduct.getPrice() * quantity
                )}{" "}
                Դր.
              </p>
              <p className={style.productInfoPriceSale}>
                Մանրածախ{" "}
                {currentProduct.formatPrice(
                  currentProduct.getPackPrice() * quantity
                )}{" "}
                Դր.
              </p>
            </>
          ) : currentProduct.getPackPrice() ? (
            <p className={style.productInfoPriceSale}>
              {currentProduct.formatPrice(
                currentProduct.getPackPrice() * quantity
              )}{" "}
              Դրամ
            </p>
          ) : (
            <p></p>
          )}
        </div>
      </div>

      <div className={style.productTitle}>
        <h2>
          {currentProduct.getDescription()}
          {/* <br /> */}
          {/* <span>{currentProduct.getTitle()}</span> */}
        </h2>
      </div>
      <div className={`flex ${style.productAction}`}>
        <div className={`${style.productActionInput} flex`}>
          <button
            onClick={() => decrement(currentProduct)}
            className={`${style.productActionInputSubstract}`}
          >
            <ArrowSVG />
          </button>
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <button
            onClick={() => increment(currentProduct)}
            className={`${style.productActionInputAdd}`}
            disabled={quantity >= currentProduct.getStock()}
          >
            <ArrowSVG />
          </button>
        </div>
        <div>
          <button
            className={`${style.productActionOrder} ${
              currentProduct.getStock() == 0 ? style.disabled : ""
            }`}
            onClick={orderItem}
            disabled={placeholder || currentProduct.getStock() == 0}
          >
            Ավելացնել
          </button>
        </div>
      </div>
      {currentProduct.getStock() == 0 ? (
        <div className={style.limited}>
          <p>Շուտով</p>
        </div>
      ) : currentProduct.getStock() <= 10 ? (
        <div className={style.limited}>
          <p>Սպառվում է</p>
        </div>
      ) : (
        <></>
      )}
    </section>
  );
}
