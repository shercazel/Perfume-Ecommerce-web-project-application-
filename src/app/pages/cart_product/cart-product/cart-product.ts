import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CurrentUser, LocationOption } from '../../../services/auth-service';
import { CartItem, CartService } from '../../../services/cart-service';

type CheckoutStep = 'cart' | 'details' | 'confirmation' | 'finished';

type ProvinceOption = {
  id?: number;
  name: string;
  cities?: string[];
};

type CheckoutErrors = {
  name?: string;
  contact?: string;
  province?: string;
  city?: string;
  address?: string;
};

type CheckoutCustomer = {
  name: string;
  contact: string;
  province: string;
  city: string;
  address: string;
  paymentMethod: string;
};

@Component({
  selector: 'app-cart-product',
  imports: [CurrencyPipe, FormsModule, NgFor, NgIf, PercentPipe],
  templateUrl: './cart-product.html',
  styleUrl: './cart-product.css',
})
export class CartProduct implements OnInit {
  checkoutMessage = '';
  checkoutErrors: CheckoutErrors = {};
  checkoutStep: CheckoutStep = 'cart';
  orderTotal = 0;
  orderReference = '';
  isSubmittingOrder = false;
  selectedItemIds = new Set<string>();
  private readonly ordersApiUrl = 'http://localhost:3000/api/orders';
  readonly contactPattern = '^(09\\d{9}|\\+639\\d{9})$';
  private readonly fullNamePattern =
    /^(?=.{1,80}$)(?=\S+\s+\S+)(?:\p{L}+(?:[.-]\p{L}+)*\.?|Jr\.?|Sr\.?|III|IV|V)(?:\s+(?:\p{L}+(?:[.-]\p{L}+)*\.?|Jr\.?|Sr\.?|III|IV|V))+$/u;
  private readonly contactNumberPattern = /^(09\d{9}|\+639\d{9})$/;
  private readonly addressPattern = /^(?=.{10,200}$)(?=.*\d)[\p{L}\p{N}\s,.\-/#]+$/u;
  customer = {
    name: '',
    contact: '',
    province: '',
    city: '',
    address: '',
    paymentMethod: 'cod',
  };
  allCities: LocationOption[] = [];
  provinceOptions: ProvinceOption[] = [
    {
      name: 'Metro Manila',
      cities: [
        'Caloocan',
        'Las Pinas',
        'Makati',
        'Malabon',
        'Mandaluyong',
        'Manila',
        'Marikina',
        'Muntinlupa',
        'Navotas',
        'Paranaque',
        'Pasay',
        'Pasig',
        'Quezon City',
        'San Juan',
        'Taguig',
        'Valenzuela',
      ],
    },
    {
      name: 'Cavite',
      cities: ['Bacoor', 'Cavite City', 'Dasmarinas', 'General Trias', 'Imus', 'Tagaytay', 'Trece Martires'],
    },
    {
      name: 'Laguna',
      cities: ['Binan', 'Calamba', 'San Pablo', 'San Pedro', 'Santa Rosa'],
    },
    {
      name: 'Bulacan',
      cities: ['Baliwag', 'Malolos', 'Meycauayan', 'San Jose del Monte'],
    },
    {
      name: 'Rizal',
      cities: ['Antipolo', 'Cainta', 'Rodriguez', 'San Mateo', 'Taytay'],
    },
    {
      name: 'Batangas',
      cities: ['Batangas City', 'Lipa', 'Santo Tomas', 'Tanauan'],
    },
    {
      name: 'Pampanga',
      cities: ['Angeles', 'Mabalacat', 'San Fernando'],
    },
  ];

  constructor(
    public readonly cartService: CartService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadCheckoutLocations();

    const checkoutItemId = this.route.snapshot.queryParamMap.get('checkout');

    if (!checkoutItemId) return;

    const item = this.cartService.cartItems().find((cartItem) => cartItem.id === checkoutItemId);

    if (item) {
      this.selectedItemIds = new Set([item.id]);
      this.startCheckout();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { checkout: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  get selectedItems(): CartItem[] {
    return this.cartService.cartItems().filter((item) => this.selectedItemIds.has(item.id));
  }

  get allItemsSelected(): boolean {
    const items = this.cartService.cartItems();
    return items.length > 0 && items.every((item) => this.selectedItemIds.has(item.id));
  }

  get selectedOriginalSubtotal(): number {
    return this.selectedItems.reduce((total, item) => total + this.cartService.itemOriginalTotal(item), 0);
  }

  get selectedSubtotal(): number {
    return this.selectedItems.reduce((total, item) => total + this.cartService.itemTotal(item), 0);
  }

  get selectedDiscountTotal(): number {
    return this.selectedOriginalSubtotal - this.selectedSubtotal;
  }

  get selectedTotal(): number {
    return this.selectedSubtotal;
  }

  get isCartLocked(): boolean {
    return this.checkoutStep !== 'cart';
  }

  get cityOptions(): string[] {
    if (this.allCities.length > 0) {
      const provinceId = this.provinceOptions.find(
        (province) => province.name === this.customer.province,
      )?.id;

      return provinceId
        ? this.allCities
            .filter((city) => city.provinceId === provinceId)
            .map((city) => city.name)
        : [];
    }

    return this.provinceOptions.find((province) => province.name === this.customer.province)?.cities ?? [];
  }

  itemTotal(item: CartItem) {
    return this.cartService.itemTotal(item);
  }

  isSelected(item: CartItem): boolean {
    return this.selectedItemIds.has(item.id);
  }

  toggleItemSelection(item: CartItem) {
    if (this.isCartLocked) return;

    if (this.selectedItemIds.has(item.id)) {
      this.selectedItemIds.delete(item.id);
    } else {
      this.selectedItemIds.add(item.id);
    }

    this.checkoutMessage = '';
  }

  toggleAllItems() {
    if (this.isCartLocked) return;

    if (this.allItemsSelected) {
      this.selectedItemIds.clear();
    } else {
      this.selectedItemIds = new Set(this.cartService.cartItems().map((item) => item.id));
    }

    this.checkoutMessage = '';
  }

  checkoutItem(item: CartItem) {
    if (this.isCartLocked) return;

    this.selectedItemIds = new Set([item.id]);
    this.startCheckout();
  }

  decreaseQuantity(item: CartItem) {
    if (this.isCartLocked) return;

    if (item.quantity > 1) {
      this.cartService.decreaseQuantity(item.id);
    }
  }

  onProvinceChange() {
    this.customer.city = '';
  }

  startCheckout() {
    if (this.cartService.cartItems().length === 0) {
      this.checkoutMessage = 'Your cart is empty.';
      return;
    }

    if (this.selectedItems.length === 0) {
      this.checkoutMessage = 'Please select at least one item to checkout.';
      return;
    }

    this.prefillCustomerFromAccount();
    this.checkoutMessage = '';
    this.checkoutErrors = {};
    this.checkoutStep = 'details';
  }

  continueToConfirmation() {
    this.checkoutErrors = this.validateCheckoutDetails();

    if (Object.keys(this.checkoutErrors).length > 0) {
      this.checkoutMessage = 'Please fix the highlighted checkout details.';
      return;
    }

    this.checkoutMessage = '';
    this.checkoutStep = 'confirmation';
  }

  backToDetails() {
    this.checkoutMessage = '';
    this.checkoutErrors = {};
    this.checkoutStep = 'details';
  }

  cancelCheckout() {
    this.checkoutStep = 'cart';
    this.checkoutMessage = 'Checkout cancelled. Your selected items are still in your cart.';
    this.checkoutErrors = {};
    this.customer = this.createEmptyCustomer();
  }

  async finishCheckout() {
    if (this.isSubmittingOrder) return;

    const orderedItems = this.selectedItems;
    const checkedOutIds = orderedItems.map((item) => item.id);

    if (checkedOutIds.length === 0) {
      this.checkoutMessage = 'Please select at least one item to checkout.';
      this.checkoutStep = 'cart';
      return;
    }

    const user = this.authService.getCurrentUser();

    this.isSubmittingOrder = true;
    this.checkoutMessage = 'Saving your order...';

    try {
      const order = await this.createOrderRequest({
        userId: user?.id,
        customer: { ...this.customer },
        items: orderedItems.map((item) => ({
          id: item.id,
          name: item.perfName,
          description: item.description,
          imagePath: item.imagePath,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      this.orderTotal = Number(order.total);
      this.orderReference = order.reference;
      this.cartService.removeItems(checkedOutIds);
      this.selectedItemIds.clear();
      this.checkoutMessage = '';
      this.checkoutStep = 'finished';
    } catch (error) {
      this.checkoutMessage =
        error instanceof Error ? error.message : 'Unable to save order. Please try again.';
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  resetCheckout() {
    this.checkoutMessage = '';
    this.checkoutErrors = {};
    this.checkoutStep = 'cart';
    this.orderTotal = 0;
    this.orderReference = '';
    this.customer = {
      ...this.createEmptyCustomer(),
    };
  }

  private createEmptyCustomer() {
    return {
      name: '',
      contact: '',
      province: '',
      city: '',
      address: '',
      paymentMethod: 'cod',
    };
  }

  private prefillCustomerFromAccount() {
    const user = this.authService.getCurrentUser();

    if (!user) return;

    this.customer = {
      ...this.customer,
      name: this.customer.name || this.getUserFullName(user),
      contact: this.customer.contact || user.phoneNumber || '',
      province: this.customer.province || user.provinceName || '',
      city: this.customer.city || user.cityName || '',
      address: this.customer.address || user.address || '',
    };
  }

  private getUserFullName(user: CurrentUser): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  private loadCheckoutLocations() {
    this.authService.getLocations().subscribe({
      next: ({ cities, provinces }) => {
        this.allCities = cities;
        this.provinceOptions = provinces;
      },
    });
  }

  private async createOrderRequest(order: {
    userId?: string;
    customer: CheckoutCustomer;
    items: {
      id: string;
      name: string;
      description: string;
      imagePath?: string;
      size: string;
      quantity: number;
      price: number;
    }[];
  }): Promise<{ id: number; reference: string; total: number }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(this.ordersApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
        signal: controller.signal,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || 'Unable to save order. Please try again.');
      }

      return result.order;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Order saving is taking too long. Please try again.');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private validateCheckoutDetails(): CheckoutErrors {
    const errors: CheckoutErrors = {};
    const name = this.customer.name.trim();
    const contact = this.customer.contact.trim();
    const address = this.customer.address.trim();

    if (!name) {
      errors.name = 'Enter your full name.';
    } else if (!this.fullNamePattern.test(name)) {
      errors.name = 'Use at least 2 words, max 80 characters. Letters, hyphen, and period only.';
    }

    if (!contact) {
      errors.contact = 'Enter your contact number.';
    } else if (!this.contactNumberPattern.test(contact)) {
      errors.contact = 'Enter a valid PH mobile number like 09171234567 or +639171234567.';
    }

    if (!this.customer.province) {
      errors.province = 'Select your province.';
    }

    if (!this.customer.city) {
      errors.city = 'Select your city.';
    }

    if (!address) {
      errors.address = 'Enter your street or barangay address.';
    } else if (!this.addressPattern.test(address)) {
      errors.address =
        'Address must be 10-200 characters, include a house/unit number, and use only letters, numbers, spaces, comma, period, hyphen, slash, or #.';
    }

    return errors;
  }
}
