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
  customer = {
    name: '',
    contact: '',
    address: '',
    paymentMethod: 'cod',
  };

  constructor(public readonly cartService: CartService) {}

  itemTotal(item: CartItem) {
    return this.cartService.itemTotal(item);
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
    this.orderTotal = this.cartService.total();
    this.orderReference = `VC-${Date.now().toString().slice(-6)}`;
    this.cartService.clearCart();
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
