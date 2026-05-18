import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-add-to-cart-container',
  imports: [CurrencyPipe, DatePipe, PercentPipe],
  templateUrl: './add-to-cart-container.html',
  styleUrl: './add-to-cart-container.css',
})
export class AddToCartContainer {
  price = '129.00';
  name = 'Perfume Name';
  today = new Date();
  discount = 0.2;
}
