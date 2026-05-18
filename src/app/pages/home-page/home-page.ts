import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, LowerCasePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [RouterOutlet, RouterLink, UpperCasePipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {







  heroBackgroundImage = './heroSec.png';

  promCards = [
    {
      discount: 'For 20% Discount',
      description: 'Exclusive Perfume Deals',
      buttonText: 'Shop Now',
      image: 'assets/images/carouselImage/womenDiscount.svg',
    },
    {
      discount: 'For 20% Discount',
      description: 'Get 20% off on your purchase',
      buttonText: 'Shop Now',
      image: 'assets/images/carouselImage/menDiscount.svg',
    },
  ];

  // value section
  valueSection = [
    {
      heading: 'Why Choose Us?',
    },
    {
      cardsTitle: 'Personalized Scent Matching',
      cardsDescription:
        'We don’t just sell perfumes we match scents to your personality. Take our quiz and find your signature fragrance in seconds.',
      imagePath: 'assets/images/carouselImage/womanPerf.svg',
      cardNumber: '01',
    },
    {
      cardsTitle: 'Long-Lasting Performance',
      cardsDescription:
        'Our perfumes are crafted to stay with you for hours, delivering a consistent and elegant scent from day to night.',
      imagePath: 'assets/images/carouselImage/womanPerf.svg',
      cardNumber: '02',
    },
    {
      cardsTitle: 'Premium Perfume Selection',
      cardsDescription:
        'Discover carefully curated perfumes made with high-quality fragrance oils for a luxurious scent experience.',
      imagePath: 'assets/images/carouselImage/womanPerf.svg',
      cardNumber: '03',
    },
  ];
}
