import { Component } from '@angular/core';

@Component({
  selector: 'app-all-collection',
  imports: [],
  templateUrl: './all-collection.html',
  styleUrl: './all-collection.css',
})
export class AllCollection {
  allCollection = [
    {
      perfName: 'Perfume ni Sherwin',
      description: 'eau de perfume',
      imagePath: 'assets/images/carouselImage/womenPerf.svg',
      imageIcon: 'assets/images/carouselImage/womenPerf.svg',
      price: '79.00',
      onlanguagechange: '99.00',
      badge: '20% OFF',
      button: 'Add to Cart',
      buttonIcon: 'assets/images/cart.svg',
    },
    {
      perfName: 'Perfume ni Sherwin',
      description: 'eau de perfume',
      imagePath: 'assets/images/carouselImage/womenPerf.svg',
      imageIcon: 'assets/images/carouselImage/womenPerf.svg',
      price: '79.00',
      onlanguagechange: '99.00',
      badge: '20% OFF',
      button: 'Add to Cart',
      buttonIcon: 'assets/images/cart.svg',
    },
  ];
}
