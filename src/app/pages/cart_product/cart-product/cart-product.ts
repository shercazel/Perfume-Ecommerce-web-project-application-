import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-product',
  imports: [],
  templateUrl: './cart-product.html',
  styleUrl: './cart-product.css',
})
export class CartProduct {
  cartItems = [
    {
      perfName: 'Pabango ni sherwin',
      description: 'Mabango bango',
      price: '₱79.00',
      size: '50mL',
      quantity: 1,
      total: '₱79.00',
    },
    {
      perfName: 'Perfume Name',
      description: 'Perfume Description',
      price: '₱79.00',
      quantity: 1,
      total: '₱79.00',
    },
  ];
}
