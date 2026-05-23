import { Component } from '@angular/core';
import { CurrencyPipe, NgFor, PercentPipe } from '@angular/common';
import { CartProductItem, CartService } from '../../../../services/cart-service';

@Component({
  selector: 'app-all-collection',
  imports: [CurrencyPipe, NgFor, PercentPipe],
  templateUrl: './all-collection.html',
  styleUrl: './all-collection.css',
})
export class AllCollection {
  constructor(private readonly cartService: CartService) {}

  allCollection: CartProductItem[] = [
    {
      id: 'perfume-ni-sherwin',
      perfName: 'Perfume ni Sherwin',
      description: 'eau de perfume',
      imagePath: 'assets/images/carouselImage/honeyPerf.svg',
      size: '50mL',
      price: 79,
      originalPrice: 99,
      discountRate: 0.2,
    },
    {
      id: 'midnight-romance',
      perfName: 'Midnight Romance',
      description: 'eau de perfume',
      imagePath: 'assets/images/carouselImage/perfBlue.png',
      size: '50mL',
      price: 89,
      originalPrice: 119,
      discountRate: 0.25,
    },
    {
      id: 'sweet-bloom',
      perfName: 'Sweet Bloom',
      description: 'fresh floral scent',
      imagePath: 'assets/images/carouselImage/romanceImg.svg',
      size: '30mL',
      price: 69,
      originalPrice: 89,
      discountRate: 0.22,
    },
    {
      id: 'office-mist',
      perfName: 'Office Mist',
      description: 'clean everyday scent',
      imagePath: 'assets/images/carouselImage/honeyPerf.svg',
      size: '50mL',
      price: 99,
      originalPrice: 129,
      discountRate: 0.23,
    },
  ];

  addToCart(product: CartProductItem) {
    this.cartService.addToCart(product);
  }
}
