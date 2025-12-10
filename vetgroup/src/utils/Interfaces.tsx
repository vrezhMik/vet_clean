import {
  FilterType,
  ProductType,
  CardView,
  UserMenu,
  CurrentUserType,
  OrderHistoryType,
} from "./Types";
import { Item } from "@/classes/ItemClass";

export interface ImagePropsInterface {
  url: string;
  alt: string;
}

export interface CardProductViewPropsInterface {
  item: Item | null;
}

export interface ProductPropsInterface {
  data: ProductType;
  placeholder: boolean;
}

export interface FiltersStateInterface {
  filters: FilterType[];
  addFilter: (filter: FilterType) => void;
  removeFilter: (id: string) => void;
}

export interface CartStateInterface {
  cartItems: Item[];
  cartTotal: number;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  getItemCount: () => number;
  cleanCart: () => void;
  updateQty: (id: string, qty: number) => void;
  updateCart: (items: Item[]) => void;

  updateTotal: (products: Item[]) => void;
}

export interface CardStateInterface {
  cardState: boolean;
  currentItem: Item | null;
  setCurrentItem: (item: Item | null) => void;
  setCardState: (value: boolean) => void;
}

export interface CardViewInterface {
  cardViewState: CardView;
  setCardView: (view: CardView) => void;
}

export interface UserMenuStateInterface {
  activeState: UserMenu;
  setActiveState: (value: UserMenu) => void;
}

export interface CurrentUserStateInterface {
  user_data: CurrentUserType;
  set_current_user: (user: CurrentUserType) => void;
}

export interface LoginStateInterface {
  is_logged_in: boolean;
  set_logged_in_status: (status: boolean) => void;
}

export interface CategorizedProduct {
  cat: string;
  cat_prods: ProductType[];
}

export interface ProductsStateInterface {
  products: ProductType[];
  categorizedProducts: CategorizedProduct[];
  searchQuery: string;
  loading: boolean;
  selectedCategories: string[];
  addCategorizedProducts: (cat: string, products: ProductType[]) => void;
  setSearchQuery: (query: string) => void;
  add_product: (product: ProductType[]) => void;
  setSelectedCategory: (category: string) => void;
  setLoading: (value: boolean) => void;
  resetCategorizedProducts: () => void;
  resetSelectedCategories: () => void;
  currentStart: number;
  setCurrentStart: (start: number) => void;
  categorizedStart: { [cat: string]: number };
  setCategorizedStart: (cat: string, start: number) => void;
  resetCategorizedStart: () => void;
  clearCategorizedProducts: (cat: string) => void;
}

export interface LoginFormStateInterface {
  isError: boolean;
  setIsError: (value: boolean) => void;
}

export interface HistoryCardInterface {
  currentHistoryItem: ProductType[] | OrderHistoryType;
  setCurrentHistoryItem: (item: ProductType[] | OrderHistoryType) => void;
}
