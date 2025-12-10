export type CartItemType = {
  id: string;
  name: string;
  description: string;
  weight: number;
  price: number;
  image: string;
  qty: number;
  salePrcentage: number;
  saledPrice: number;
  totalPrice: number;
};

export type FilterType = {
  id: string;
  value: string;
};

export enum CardView {
  Product,
  List,
  History,
}

export enum UserMenu {
  History,
  Settings,
}

export type CurrentUserType = {
  documentId: string;
  first_name: string;
  last_name: string;
  company: string;
};

export type OrderType = {
  order_id: string;
  created: string;
  total: string;
  products_json: [];
};

export type ProductType = {
  code: string;
  stock: number;
  name: string;
  description: string;
  price: number;
  pack_price: number;
  image: { url: string } | null;
  backendId: null | string;
  qty: number;
  totalPrice: number;
  __typename: string;
  category: {
    title: string;
  };
};

export type OrderHistoryType = {
  TransactionDate: string;
  ClientID: string;
  ItemsList: [{ ItemID: string; Quantity: number }];
  Note: string;
};
