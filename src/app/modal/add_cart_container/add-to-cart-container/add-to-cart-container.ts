import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, NgIf, PercentPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart-service';

@Component({
  selector: 'app-add-to-cart-container',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgIf, PercentPipe],
  templateUrl: './add-to-cart-container.html',
  styleUrls: ['./add-to-cart-container.css'],
})
export class AddToCartContainer {
  today = new Date();

  constructor(
    public readonly cartService: CartService,
    private readonly router: Router,
  ) {}

  closePreview() {
    this.cartService.hideCartPreview();
  }

  viewCart() {
    this.closePreview();
    this.router.navigate(['/cartProduct']);
  }

  checkoutLatestItem() {
    const latestItem = this.cartService.latestItem();
    this.closePreview();

    this.router.navigate(['/cartProduct'], {
      queryParams: latestItem ? { checkout: latestItem.id } : undefined,
    });
  }
}
