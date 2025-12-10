import { create } from "zustand";
import { CardView, UserMenu } from "@/utils/Types";
import { Item } from "@/classes/ItemClass";
import {
  ProductsStateInterface,
  LoginFormStateInterface,
  FiltersStateInterface,
  LoginStateInterface,
  CartStateInterface,
  UserMenuStateInterface,
  CardViewInterface,
  CurrentUserStateInterface,
  CardStateInterface,
  HistoryCardInterface,
} from "@/utils/Interfaces";

export const useFilters = create<FiltersStateInterface>((set) => ({
  filters: [],
  addFilter: (filter) =>
    set((state) => ({
      filters: [...state.filters, filter],
    })),
  removeFilter: (id) =>
    set((state) => ({
      filters: state.filters.filter((filter) => filter.id !== id),
    })),
}));

export const useCart = create<CartStateInterface>((set, get) => ({
  cartItems: [],
  cartTotal: 0,

  addItem: (item) =>
    set((state) => {
      const existingItemIndex = state.cartItems.findIndex(
        (cartItem) => cartItem.getId() === item.getId()
      );

      let updatedCartItems;
      if (existingItemIndex !== -1) {
        updatedCartItems = [...state.cartItems];
        updatedCartItems[existingItemIndex].setQty(item.getQty());
      } else {
        updatedCartItems = [...state.cartItems, item];
      }

      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

      return {
        cartItems: updatedCartItems,
        cartTotal: updatedCartItems.reduce(
          (total, cartItem) => total + cartItem.getPrice() * cartItem.getQty(),
          0
        ),
      };
    }),

  removeItem: (id) =>
    set((state) => {
      const itemToRemove = state.cartItems.find((item) => item.getId() === id);
      if (!itemToRemove) {
        return state;
      }

      const updatedCartItems = state.cartItems.filter(
        (item) => item.getId() !== id
      );
      const itemPrice = itemToRemove.getPrice() * itemToRemove.getQty();

      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

      return {
        cartItems: updatedCartItems,
        cartTotal: state.cartTotal - itemPrice,
      };
    }),

  getItemCount: () => get().cartItems.length,
  updateQty: (id: string, qty: number) =>
    set((state) => {
      const updatedCartItems = state.cartItems.map((item) =>
        item.getId() === id ? new Item(item, qty) : item
      );

      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

      const updatedCartTotal = updatedCartItems.reduce(
        (total, cartItem) => total + cartItem.getPrice() * cartItem.getQty(),
        0
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

      return {
        cartItems: updatedCartItems,
        cartTotal: updatedCartTotal,
      };
    }),
  updateTotal: (products: Item[]) => {
    const total = products.reduce(
      (acc, product) => acc + product.getPrice() * product.getQty(),
      0
    );

    set(() => ({
      cartTotal: total,
    }));
  },
  updateCart: (items: Item[]) => {
    const total = items.reduce(
      (acc, item) => acc + item.getPrice() * item.getQty(),
      0
    );
    localStorage.setItem("cartItems", JSON.stringify(items));
    set(() => ({
      cartItems: items,
      cartTotal: total,
    }));
  },
  cleanCart: () =>
    set(() => {
      localStorage.removeItem("cartItems");
      return {
        cartItems: [],
      };
    }),
}));

export const useCard = create<CardStateInterface>((set) => ({
  cardState: false,
  currentItem: null,

  setCardState: (value) =>
    set(() => ({
      cardState: value,
    })),
  setCurrentItem: (item) =>
    set(() => ({
      currentItem: item,
    })),
}));

export const useCardView = create<CardViewInterface>((set) => ({
  cardViewState: CardView.List,
  setCardView: (value) =>
    set(() => ({
      cardViewState: value,
    })),
}));

export const useUserPageMenu = create<UserMenuStateInterface>((set) => ({
  activeState: UserMenu.History,
  setActiveState: (value) =>
    set(() => ({
      activeState: value,
    })),
}));

export const useCurrentUser = create<CurrentUserStateInterface>((set) => ({
  user_data: {
    documentId: "",
    first_name: "",
    last_name: "",
    company: "",
  },
  set_current_user: (user) =>
    set(() => ({
      user_data: user,
    })),
}));

export const logInState = create<LoginStateInterface>((set) => ({
  is_logged_in: false,
  set_logged_in_status: (status) =>
    set(() => ({
      is_logged_in: status,
    })),
}));

export const productsStore = create<ProductsStateInterface>((set, get) => ({
  products: [],
  categorizedProducts: [],
  searchQuery: "",
  loading: true,
  selectedCategories: [],

  currentStart: 0,
  categorizedStart: {},

  setCurrentStart: (start) => set({ currentStart: start }),

  setCategorizedStart: (cat, start) =>
    set((state) => ({
      categorizedStart: { ...state.categorizedStart, [cat]: start },
    })),

  resetCategorizedStart: () => set({ categorizedStart: {} }),

  setLoading: (value) => set({ loading: value }),

  resetCategorizedProducts: () => set({ categorizedProducts: [] }),

  resetSelectedCategories: () => set({ selectedCategories: [] }),

  setSelectedCategory: (category) => {
    const current = get().selectedCategories[0];
    set({
      selectedCategories: current === category ? [] : [category],
      searchQuery: "",
    });
  },

  addCategorizedProducts: (cat, newProducts) =>
    set((state) => {
      const existing = state.categorizedProducts.find((p) => p.cat === cat);
      const updated = existing
        ? state.categorizedProducts.map((item) =>
            item.cat === cat
              ? { ...item, cat_prods: [...item.cat_prods, ...newProducts] }
              : item
          )
        : [...state.categorizedProducts, { cat, cat_prods: newProducts }];

      return { categorizedProducts: updated };
    }),

  setSearchQuery: (query) => {
    const trimmed = query;
    set((state) => ({
      searchQuery: trimmed,
      selectedCategories: trimmed.length > 0 ? [] : state.selectedCategories,
    }));
  },

  add_product: (newProducts) =>
    set((state) => ({
      products: [...state.products, ...newProducts],
      loading: false,
    })),
  clearCategorizedProducts: (cat) =>
    set((state) => ({
      categorizedProducts: state.categorizedProducts.filter(
        (c) => c.cat !== cat
      ),
    })),
}));

export const loginFormState = create<LoginFormStateInterface>((set) => ({
  isError: false,
  setIsError: (value) => set({ isError: value }),
}));

export const HistoryCardState = create<HistoryCardInterface>((set) => ({
  currentHistoryItem: [],
  setCurrentHistoryItem: (item) => set({ currentHistoryItem: item }),
}));
