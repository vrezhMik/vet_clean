import { graphQL_Query } from "./graphql";
import { LOGIN_FRAGMENT } from "./fragments";
import { USER_FRAGMENT } from "./fragments";
import { CHANGE_PASSWORD_FRAGMENT } from "./fragments";
import { GET_PRODUCTS_FRAGMENT } from "./fragments";
import Cookies from "js-cookie";
import { Item } from "@/classes/ItemClass";
import { GET_USER_ORDERS } from "./fragments";
import { ApolloError } from "@apollo/client";
import { loginFormState } from "@/store/store";
import { GET_CATEGORIES } from "./fragments";
import { GET_PRODCUTS_BY_CAT } from "./fragments";
import { GET_SEARCH_FRAGMENTS } from "./fragments";
import { ADD_ORDER_FRAGMENT, GET_PRODCUTS_BY_ID } from "./fragments";

function setWrongLogin(value: boolean) {
  loginFormState.setState({ isError: value });
}

export async function login(identifier: string, password: string) {
  try {
    const response = await graphQL_Query(LOGIN_FRAGMENT, {
      identifier,
      password,
    });

    if (!response || response.errors) {
      setWrongLogin(true);
      return;
    }

    const { jwt, user } = response.login;
    const { documentId, id } = user;

    if (!jwt || !documentId) {
      throw new Error("Missing jwt or documentId in login response");
    }
    const current_user = await get_current_user(documentId);
    const code = current_user.vetgroupUsers[0].user.code;
    const company = current_user.vetgroupUsers[0].user.company;
    document.cookie = `code=${code}; path=/; SameSite=Lax`;
    document.cookie = `jwt=${jwt}; path=/; SameSite=Lax`;
    document.cookie = `document=${documentId}; path=/; SameSite=Lax`;
    document.cookie = `user=${id}; path=/; SameSite=Lax`;
    document.cookie = `company=${encodeURIComponent(
      company
    )}; path=/; SameSite=Lax`;

    setWrongLogin(false);

    window.location.href = "/";
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

export async function get_current_user(id: string) {
  try {
    const response = await graphQL_Query(USER_FRAGMENT, { id });
    if (!response || response.errors) {
      throw new Error(
        response?.errors?.[0]?.message || "Login failed due to an unknown error"
      );
    }
    return response;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

export async function change_password_query(
  old_password: string,
  new_password: string,
  confirm_password: string
) {
  try {
    const jwt = Cookies.get("jwt");
    const response = await graphQL_Query(
      CHANGE_PASSWORD_FRAGMENT,
      {
        old_password,
        new_password,
        confirm_password,
      },
      { Authorization: `Bearer ${jwt}` }
    );
    return response;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

export async function get_products(start: number, limit: number, cat?: string) {
  try {
    const response = cat
      ? await graphQL_Query(GET_PRODCUTS_BY_CAT, { cat, start, limit })
      : await graphQL_Query(GET_PRODUCTS_FRAGMENT, { start, limit });

    return response || { products: [] };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [] };
  }
}


export async function add_order(items: Item[], user: string) {
  const data = {
    TransactionDate: getFormattedDateTime(),
    ClientID: user,
    Note: "",
    ItemsList: items.map((item) => ({
      ItemID: item.backendId ?? "",
      Quantity: item.qty ?? 0,
    })),
  };

  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("Failed:", error);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

export async function get_user_orders(documentId: string) {
  try {
    const response = await graphQL_Query(GET_USER_ORDERS, {
      documentId,
    });

    if (!response || !response) {
      throw new Error("Invalid response from API");
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

export async function get_categories() {
  try {
    const response = await graphQL_Query(GET_CATEGORIES, {});
    return response;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

export async function get_products_by_cat(cat: string) {
  try {
    const response = await graphQL_Query(GET_PRODCUTS_BY_CAT, { cat: cat });
    return response;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

function buildSearchFilter(query: string) {
  const words = query.split(/\s+/).filter(Boolean);

  return {
    or: words.flatMap((word) => [
      { name: { contains: word } },
      { description: { contains: word } },
    ]),
  };
}

export async function get_search_fragments(query: string) {
  try {
    const response = await graphQL_Query(GET_SEARCH_FRAGMENTS, {
      filters: buildSearchFilter(query),
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}

function generateOrderId(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORD-";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateProductsTable(
  items: {
    name: string;
    description: string;
    qty: number;
    price: number;
  }[]
): string {
  const rows = items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.description}</td><td>${item.qty}</td><td>${item.price} AMD</td></tr>`
    )
    .join("");

  return `<table><thead><tr><th>Անվանում</th><th>Նկարագրություն</th><th>Քանակ</th><th>Գին</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function getFormattedDateTime(): string {
  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const year = now.getFullYear();

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${month}:${day}:${year} ${hours}:${minutes}:${seconds}`;
}

export async function add_strapi_order(
  cartItems: Item[],
  total: number,
  userId: string,
  complited: boolean,
  user: string
) {
  const order_id = generateOrderId();
  const created = new Date().toISOString();

  const minimalProducts = cartItems.map((item) => ({
    name: item.name,
    description: item.description,
    qty: item.qty,
    price: item.price,
  }));

  const json_view = cartItems.map((item) => ({
    "ItemID": item.backendId,
    "Quantity": item.qty
  })
  );
  const json_full_data = {
    "TransactionDate": getFormattedDateTime(),
    "ClientID": user,
    "ItemsList": json_view,
    "Note": ""
  }
  const productsHtml = generateProductsTable(minimalProducts);

  try {
    const response = await graphQL_Query(ADD_ORDER_FRAGMENT, {
      order_id,
      created,
      total,
      products: productsHtml,
      products_json: json_full_data,
      users_permissions_user: userId,
      complited
    });

    if (!response || response.errors) {
      throw new Error(
        response?.errors?.[0]?.message || "Order creation failed"
      );
    }

    return { status: true };
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    return { status: false };
  }
}

export async function updateProductStock(code: string, qty: number) {
  try {
    // Step 1: Get product by code
    const getRes = await fetch(
      `https://vetgroup.am/api/products?filters[code][$eq]=${encodeURIComponent(
        code
      )}`
    );
    const getData = await getRes.json();
    const product = getData?.data?.[0];

    if (!product) {
      throw new Error(`Product with code ${code} not found`);
    }

    const productId = product.id;
    const currentStock = product.stock ?? 0;
    const newStock = qty === 0 ? 0 : Math.max(currentStock - qty, 0);

    // Step 2: Update stock
    const putRes = await fetch(
      `https://vetgroup.am/api/vetgroup-product/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { stock: newStock } }),
      }
    );

    const result = await putRes.json();

    if (result.error) throw new Error(result.error.message);

    return true;
  } catch (err) {
    console.error("❌ Stock update failed for", code, err);
    return false;
  }
}


export async function get_product_by_id(id: string) {
  try {
    const response = await graphQL_Query(GET_PRODCUTS_BY_ID, { id: id });
    return response;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      console.error("GraphQL error:", error.message);
    } else if (error instanceof Error) {
      console.error("JS error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
}
