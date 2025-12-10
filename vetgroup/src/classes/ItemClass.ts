import { ProductType } from "@/utils/Types";

export class Item implements ProductType {
  name: string;
  stock: number;
  pack_price: number;
  code: string;
  image: { url: string } | null;
  price: number;
  description: string;
  qty: number;
  totalPrice: number;
  backendId: string | null;
  __typename: string;
  category: { title: string };

  constructor(item: ProductType, qty: number | null) {
    this.name = item.name;
    this.stock = item.stock;
    this.code = item.code;
    this.price = item.price;
    this.pack_price = item.pack_price;
    this.description = item.description;
    this.qty = qty ?? 1;
    this.totalPrice = 0;
    this.image = item.image ? item.image : null;
    this.__typename = item.__typename;
    this.category = item.category;
    this.backendId = item.backendId;
  }

  getId(): string {
    return this.code;
  }

  getDescription(): string {
    return this.description;
  }
  getImage(): string | null {
    return this.image ? this.image.url : null;
  }

  getTitle(): string {
    return this.name;
  }

  getPrice(): number {
    return this.price;
  }

  getQty(): number {
    return this.qty;
  }

  setQty(value: number): void {
    this.qty = value;
  }

  setTotal(): void {
    this.totalPrice = this.getPrice() * this.getQty();
  }

  getTotalPrice(): number {
    return this.totalPrice * this.getQty();
  }
  formatPrice(value: number): string {
    if (isNaN(value)) return "0";

    const fixed = value.toFixed(2); // ensures "xxxx.xx"
    const [intPart, decimal] = fixed.split(".");

    let formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    // Only add decimal part if it's not "00"
    if (decimal !== "00") {
      formatted += "," + decimal;
    }

    return formatted;
  }
  getPackPrice() {
    return this.pack_price;
  }
  getStock() {
    return this.stock;
  }
}
