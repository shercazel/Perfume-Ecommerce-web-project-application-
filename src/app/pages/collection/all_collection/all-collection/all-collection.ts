import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgFor, PercentPipe } from '@angular/common';
import { CartProductItem, CartService } from '../../../../services/cart-service';
import { ProductService } from '../../../../services/product-service';

@Component({
  selector: 'app-all-collection',
  imports: [CurrencyPipe, NgFor, PercentPipe],
  templateUrl: './all-collection.html',
  styleUrl: './all-collection.css',
})
export class AllCollection implements OnInit {
  errorMessage = '';

  allCollection: CartProductItem[] = [];

  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allCollection = products;
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Unable to load products from the database.';
      },
    });
  }

  addToCart(product: CartProductItem) {
    this.cartService.addToCart(product);
  }
}
