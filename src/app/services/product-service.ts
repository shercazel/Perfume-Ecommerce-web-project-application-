import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CartProductItem } from './cart-service';

interface ApiProduct {
  id: number;
  image: string | null;
  name: string;
  description: string;
  stock: number;
  price: number;
  brand: string | null;
  size: string | number | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:3000/api/products';
  private readonly fallbackImage = 'assets/images/carouselImage/perfBlue.png';

  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<CartProductItem[]> {
    return this.http.get<ApiProduct[]>(this.apiUrl).pipe(
      map((products) =>
        products.map((product) => ({
          id: String(product.id),
          perfName: product.name,
          description: product.brand
            ? `${product.brand} - ${product.description}`
            : product.description,
          imagePath: product.image || this.fallbackImage,
          size: product.size ? `${product.size}mL` : 'Size unavailable',
          price: Number(product.price),
          originalPrice: Number(product.price),
          discountRate: 0,
        }))
      )
    );
  }
}
