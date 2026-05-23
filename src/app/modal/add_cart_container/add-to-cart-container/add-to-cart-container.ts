import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, NgIf, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart-service';

@Component({
  selector: 'app-add-to-cart-container',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgIf, PercentPipe, RouterLink],
  templateUrl: './add-to-cart-container.html',
  styleUrls: ['./add-to-cart-container.css'],
})
export class AddToCartContainer {
  today = new Date();

  constructor(public readonly cartService: CartService) {}

  closePreview() {
    this.cartService.hideCartPreview();
  }
}
