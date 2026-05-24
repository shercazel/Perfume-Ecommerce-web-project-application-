import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { apiUrl } from './api-url';

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
  private readonly baseStorageKey = 'votrescent-cart-items';
  private readonly cartApiUrl = apiUrl('/api/cart');
  private activeUserId = this.getCurrentUserId();
  private activeStorageKey = this.getStorageKeyForCurrentUser();
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

  constructor(private readonly http: HttpClient) {
    if (this.activeUserId) {
      this.loadDatabaseCart(this.activeUserId);
    }
  }

  useUserCart(userId?: string | number | null) {
    this.activeUserId = this.normalizeUserId(userId);
    this.activeStorageKey = this.getStorageKey(userId);
    this.hideCartPreview();

    if (this.activeUserId) {
      this.loadDatabaseCart(this.activeUserId);
      return;
    }

    this.cartItemsSignal.set(this.loadCartItems());
  }

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

  removeItems(productIds: string[]) {
    const idsToRemove = new Set(productIds);
    this.cartItemsSignal.update((items) =>
      this.persist(items.filter((item) => !idsToRemove.has(item.id))),
    );
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

    const savedItems = localStorage.getItem(this.activeStorageKey);

    if (!savedItems) {
      return [];
    }

    try {
      return JSON.parse(savedItems) as CartItem[];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]) {
    if (this.activeUserId) {
      this.saveDatabaseCart(items);
      return items;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.activeStorageKey, JSON.stringify(items));
    }

    return items;
  }

  private loadDatabaseCart(userId: string) {
    this.http.get<{ items: CartItem[] }>(`${this.cartApiUrl}?userId=${encodeURIComponent(userId)}`).subscribe({
      next: ({ items }) => {
        if (this.activeUserId === userId) {
          this.cartItemsSignal.set(items);
        }
      },
      error: () => {
        if (this.activeUserId === userId) {
          this.cartItemsSignal.set([]);
        }
      },
    });
  }

  private saveDatabaseCart(items: CartItem[]) {
    const userId = this.activeUserId;

    if (!userId) return;

    this.http.put<{ items: CartItem[] }>(this.cartApiUrl, { userId, items }).subscribe({
      next: ({ items: savedItems }) => {
        if (this.activeUserId === userId) {
          this.cartItemsSignal.set(savedItems);
        }
      },
    });
  }

  private getStorageKeyForCurrentUser() {
    return this.getStorageKey(this.activeUserId);
  }

  private getStorageKey(userId?: string | number | null) {
    const normalizedUserId = this.normalizeUserId(userId);
    return normalizedUserId
      ? `${this.baseStorageKey}-user-${normalizedUserId}`
      : `${this.baseStorageKey}-guest`;
  }

  private getCurrentUserId() {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const savedUser = localStorage.getItem('currentUser');
      const user = savedUser ? (JSON.parse(savedUser) as { id?: string | number }) : null;
      return this.normalizeUserId(user?.id);
    } catch {
      return null;
    }
  }

  private normalizeUserId(userId?: string | number | null) {
    return String(userId || '').trim() || null;
  }
}
