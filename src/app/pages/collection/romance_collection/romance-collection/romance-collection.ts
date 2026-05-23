import { CurrencyPipe, NgFor, PercentPipe } from '@angular/common';
import { Component } from '@angular/core';
import { CartProductItem, CartService } from '../../../../services/cart-service';

@Component({
  selector: 'app-romance-collection',
  imports: [CurrencyPipe, NgFor, PercentPipe],
  templateUrl: './romance-collection.html',
  styleUrl: './romance-collection.css',
})
export class RomanceCollection {
  constructor(private readonly cartService: CartService) {}

  romanceCollection: CartProductItem[] = [
    {
      id: 'romance-rose',
      perfName: 'Romance Rose',
      description: 'soft romantic floral',
      imagePath: 'assets/images/carouselImage/romanceImg.svg',
      size: '50mL',
      price: 79,
      originalPrice: 99,
      discountRate: 0.2,
    },
    {
      id: 'velvet-date',
      perfName: 'Velvet Date',
      description: 'warm evening scent',
      imagePath: 'assets/images/carouselImage/honeyPerf.svg',
      size: '50mL',
      price: 89,
      originalPrice: 119,
      discountRate: 0.25,
    },
    {
      id: 'blush-moment',
      perfName: 'Blush Moment',
      description: 'sweet floral perfume',
      imagePath: 'assets/images/carouselImage/perfBlue.png',
      size: '30mL',
      price: 69,
      originalPrice: 89,
      discountRate: 0.22,
    },
  ];

  addToCart(product: CartProductItem) {
    this.cartService.addToCart(product);
  }
}
