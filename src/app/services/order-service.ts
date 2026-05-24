import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

export interface CheckoutOrderItem {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  size: string;
  quantity: number;
  price: number;
}

export interface CheckoutOrderPayload {
  userId?: string;
  customer: {
    name: string;
    contact: string;
    province: string;
    city: string;
    address: string;
    paymentMethod: string;
  };
  items: CheckoutOrderItem[];
}

export interface CreatedOrder {
  id: number;
  reference: string;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:3000/api/orders';

  constructor(private readonly http: HttpClient) {}

  createOrder(order: CheckoutOrderPayload): Observable<{ message: string; order: CreatedOrder }> {
    return this.http.post<{ message: string; order: CreatedOrder }>(this.apiUrl, order).pipe(timeout(15000));
  }
}
