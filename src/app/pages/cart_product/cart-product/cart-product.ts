import { Component } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf, PercentPipe } from '@angular/common';
import { CartItem, CartService } from '../../../services/cart-service';

@Component({
  selector: 'app-cart-product',
  imports: [CurrencyPipe, NgFor, NgIf, PercentPipe],
  templateUrl: './cart-product.html',
  styleUrl: './cart-product.css',
})
export class CartProduct {
  checkoutMessage = '';

  constructor(public readonly cartService: CartService) {}

  itemTotal(item: CartItem) {
    return this.cartService.itemTotal(item);
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.decreaseQuantity(item.id);
    }
  }

  proceedToCheckout() {
    if (this.cartService.cartItems().length === 0) {
      this.checkoutMessage = 'Your cart is empty.';
      return;
    }

    this.checkoutMessage = `Order placed. Total paid: ${new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(this.cartService.total())}`;
    this.cartService.clearCart();
  }
}
