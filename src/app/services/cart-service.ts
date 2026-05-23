import { Injectable, computed, signal } from '@angular/core';

export interface CartProductItem {
  id: string;
  perfName: string;
  description: string;
  imagePath: string;
  size: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
}

export interface CartItem extends CartProductItem {
  quantity: number;
  addedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'votrescent-cart-items';
  private readonly cartItemsSignal = signal<CartItem[]>(this.loadCartItems());
  private readonly cartPreviewOpenSignal = signal(false);

  readonly cartItems = this.cartItemsSignal.asReadonly();
  readonly cartPreviewOpen = this.cartPreviewOpenSignal.asReadonly();
  readonly latestItem = computed(() => this.cartItems()[this.cartItems().length - 1] ?? null);
  readonly totalQuantity = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.cartItems().reduce((total, item) => total + item.price * item.quantity, 0),
  );
  readonly originalSubtotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + (item.originalPrice ?? item.price) * item.quantity,
      0,
    ),
  );
  readonly discountTotal = computed(() => this.originalSubtotal() - this.subtotal());
  readonly total = computed(() => this.subtotal());

  addToCart(product: CartProductItem) {
    this.cartItemsSignal.update((items) => {
      const existingItem = items.find((item) => item.id === product.id);

      if (existingItem) {
        return this.persist(
          items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1, addedAt: new Date().toISOString() }
              : item,
          ),
        );
      }

      return this.persist([...items, { ...product, quantity: 1, addedAt: new Date().toISOString() }]);
    });
    this.showCartPreview();
  }

  showCartPreview() {
    this.cartPreviewOpenSignal.set(true);
  }

  hideCartPreview() {
    this.cartPreviewOpenSignal.set(false);
  }

  increaseQuantity(productId: string) {
    this.cartItemsSignal.update((items) =>
      this.persist(
        items.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      ),
    );
  }

  decreaseQuantity(productId: string) {
    this.cartItemsSignal.update((items) =>
      this.persist(
        items.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item,
        ),
      ),
    );
  }

  removeItem(productId: string) {
    this.cartItemsSignal.update((items) => this.persist(items.filter((item) => item.id !== productId)));
  }

  clearCart() {
    this.cartItemsSignal.set(this.persist([]));
    this.hideCartPreview();
  }

  itemTotal(item: CartItem) {
    return item.price * item.quantity;
  }

  itemOriginalTotal(item: CartItem) {
    return (item.originalPrice ?? item.price) * item.quantity;
  }

  itemDiscountTotal(item: CartItem) {
    return this.itemOriginalTotal(item) - this.itemTotal(item);
  }

  private loadCartItems(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const savedItems = localStorage.getItem(this.storageKey);
    return savedItems ? (JSON.parse(savedItems) as CartItem[]) : [];
  }

  private persist(items: CartItem[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }

    return items;
  }
}
