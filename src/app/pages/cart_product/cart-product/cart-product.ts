import { Component } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem, CartService } from '../../../services/cart-service';

type CheckoutStep = 'cart' | 'details' | 'confirmation' | 'finished';

@Component({
  selector: 'app-cart-product',
  imports: [CurrencyPipe, FormsModule, NgFor, NgIf, PercentPipe],
  templateUrl: './cart-product.html',
  styleUrl: './cart-product.css',
})
export class CartProduct {
  checkoutMessage = '';
  checkoutStep: CheckoutStep = 'cart';
  orderTotal = 0;
  orderReference = '';
  selectedItemIds = new Set<string>();
  customer = {
    name: '',
    contact: '',
    address: '',
    paymentMethod: 'cod',
  };

  constructor(public readonly cartService: CartService) {}

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

  itemTotal(item: CartItem) {
    return this.cartService.itemTotal(item);
  }

  isSelected(item: CartItem): boolean {
    return this.selectedItemIds.has(item.id);
  }

  toggleItemSelection(item: CartItem) {
    if (this.selectedItemIds.has(item.id)) {
      this.selectedItemIds.delete(item.id);
    } else {
      this.selectedItemIds.add(item.id);
    }

    this.checkoutMessage = '';
  }

  toggleAllItems() {
    if (this.allItemsSelected) {
      this.selectedItemIds.clear();
    } else {
      this.selectedItemIds = new Set(this.cartService.cartItems().map((item) => item.id));
    }

    this.checkoutMessage = '';
  }

  checkoutItem(item: CartItem) {
    this.selectedItemIds = new Set([item.id]);
    this.startCheckout();
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.decreaseQuantity(item.id);
    }
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

    this.checkoutMessage = '';
    this.checkoutStep = 'details';
  }

  continueToConfirmation() {
    if (!this.customer.name.trim() || !this.customer.contact.trim() || !this.customer.address.trim()) {
      this.checkoutMessage = 'Please complete your name, contact number, and address.';
      return;
    }

    this.checkoutMessage = '';
    this.checkoutStep = 'confirmation';
  }

  backToDetails() {
    this.checkoutMessage = '';
    this.checkoutStep = 'details';
  }

  finishCheckout() {
    const checkedOutIds = this.selectedItems.map((item) => item.id);
    this.orderTotal = this.selectedTotal;
    this.orderReference = `VC-${Date.now().toString().slice(-6)}`;
    this.cartService.removeItems(checkedOutIds);
    this.selectedItemIds.clear();
    this.checkoutStep = 'finished';
  }

  resetCheckout() {
    this.checkoutMessage = '';
    this.checkoutStep = 'cart';
    this.orderTotal = 0;
    this.orderReference = '';
    this.customer = {
      name: '',
      contact: '',
      address: '',
      paymentMethod: 'cod',
    };
  }
}
