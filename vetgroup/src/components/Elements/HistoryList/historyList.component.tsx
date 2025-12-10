import { useState, useEffect } from "react";
import style from "./historyList.module.scss";
import FileSVG from "../Icons/FileSVG";
import { useCard, useCardView } from "@/store/store";
import { CardView } from "@/utils/Types";
import { get_user_orders } from "@/utils/query";
import { getCookie } from "@/utils/cookies";
import { OrderType } from "@/utils/Types";
import { HistoryCardState } from "@/store/store";

function HistoryList() {
  const { setCardState } = useCard();
  const { setCardView } = useCardView();
  const { setCurrentHistoryItem } = HistoryCardState();

  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      const documentId = getCookie("document");
      if (!documentId) {
        console.warn("No documentId cookie found!");
        return;
      }

      try {
        const response = await get_user_orders(documentId);

        if (!response) {
          console.warn("No orders found.");
          return;
        }
        setOrders(response.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const showCart = (data: []) => {
    setCurrentHistoryItem(data);
    setCardState(true);
    setCardView(CardView.History);
  };

  function formatDate(isoString: string): string {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function formatPrice(value: number): string {
    if (isNaN(value)) return "0,00";

    const stringPrice = value;
    return stringPrice
      .toFixed(2)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  return (
    <div className={`${style.history}`}>
      <div className={`${style.historyTitle}`}>
        <h1>Պատվերների ցանկ:</h1>
      </div>
      <div className={`${style.historyElements}`}>
        {orders.length > 0 ? (
          orders.map((element: OrderType, key: number) => (
            <div key={key} className={`flex ${style.historyElementsElement}`}>
              <p>#{element.order_id}</p>
              <p>{formatDate(element.created)}</p>
              <p>{formatPrice(parseInt(element.total))} Դրամ</p>
              <button onClick={() => showCart(element.products_json)}>
                <FileSVG />
              </button>
            </div>
          ))
        ) : (
          <p>Ոչ մի պատվեր չի գտնվել</p>
        )}
      </div>
    </div>
  );
}

export default HistoryList;
