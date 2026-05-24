import { CurrencyPipe, NgFor, NgIf, PercentPipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { CartProductItem, CartService } from '../../../services/cart-service';
import {
  COLLECTION_PRODUCTS,
  CollectionCategory,
  CollectionProduct,
} from '../collection-products';

@Component({
  selector: 'app-collection-product-grid',
  imports: [CurrencyPipe, NgFor, NgIf, PercentPipe],
  templateUrl: './collection-product-grid.html',
  styleUrl: './collection-product-grid.css',
})
export class CollectionProductGrid implements OnChanges {
  @Input() title = 'All Collection';
  @Input() category: CollectionCategory | string = 'all';

  readonly itemsPerPage = 9;
  currentPage = 1;

  constructor(private readonly cartService: CartService) {}

  ngOnChanges() {
    this.currentPage = 1;
  }

  get products() {
    if (this.category === 'all') {
      return COLLECTION_PRODUCTS;
    }

    return COLLECTION_PRODUCTS.filter((product) =>
      product.categories.includes(this.category as Exclude<CollectionCategory, 'all'>)
    );
  }

  get totalPages() {
    return Math.max(Math.ceil(this.products.length / this.itemsPerPage), 1);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  addToCart(product: CollectionProduct) {
    const cartProduct: CartProductItem = {
      id: product.id,
      perfName: product.perfName,
      description: product.description,
      imagePath: product.imagePath,
      size: product.size,
      price: product.price,
      originalPrice: product.originalPrice,
      discountRate: product.discountRate,
    };

    this.cartService.addToCart(cartProduct);
  }
}
