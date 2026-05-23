import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [RouterOutlet, RouterLink, UpperCasePipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit, OnDestroy {

  heroBackgroundImage = './heroSec.png';
  activeShowcaseSlides = [0, 0, 0, 0, 0];
  private autoSlideTimer?: ReturnType<typeof setInterval>;

  showcaseSlides = [
    [
      {
        image: 'assets/images/carouselImage/honeyPerf.svg',
        alt: 'Honey perfume collection',
      },
      {
        image: 'assets/images/carouselImage/perfBlue.png',
        alt: 'Blue perfume collection',
      },
      {
        image: 'assets/images/carouselImage/romanceImg.svg',
        alt: 'Romance perfume collection',
      },
    ],
    [
      {
        image: 'assets/images/carouselImage/perfBlue.png',
        alt: 'Fresh perfume collection',
      },
      {
        image: 'assets/images/carouselImage/romanceImg.svg',
        alt: 'Romantic perfume collection',
      },
      {
        image: 'assets/images/carouselImage/honeyPerf.svg',
        alt: 'Sweet perfume collection',
      },
    ],
    [
      {
        image: 'assets/images/carouselImage/romanceImg.svg',
        alt: 'Romance fragrance bottle',
      },
      {
        image: 'assets/images/carouselImage/honeyPerf.svg',
        alt: 'Honey fragrance bottle',
      },
      {
        image: 'assets/images/carouselImage/perfBlue.png',
        alt: 'Blue fragrance bottle',
      },
    ],
    [
      {
        image: 'assets/images/carouselImage/honeyPerf.svg',
        alt: 'Sweet scent highlight',
      },
      {
        image: 'assets/images/carouselImage/perfBlue.png',
        alt: 'Clean scent highlight',
      },
      {
        image: 'assets/images/carouselImage/romanceImg.svg',
        alt: 'Romantic scent highlight',
      },
    ],
    [
      {
        image: 'assets/images/carouselImage/perfBlue.png',
        alt: 'Everyday perfume highlight',
      },
      {
        image: 'assets/images/carouselImage/honeyPerf.svg',
        alt: 'Warm perfume highlight',
      },
      {
        image: 'assets/images/carouselImage/romanceImg.svg',
        alt: 'Evening perfume highlight',
      },
    ],
  ];

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  setShowcaseSlide(showcaseIndex: number, slideIndex: number) {
    this.activeShowcaseSlides[showcaseIndex] = slideIndex;
    this.restartAutoSlide();
  }

  moveShowcaseSlide(showcaseIndex: number, direction: number) {
    const slidesLength = this.showcaseSlides[showcaseIndex].length;
    const nextSlide =
      (this.activeShowcaseSlides[showcaseIndex] + direction + slidesLength) %
      slidesLength;

    this.setShowcaseSlide(showcaseIndex, nextSlide);
  }

  getShowcaseTransform(showcaseIndex: number) {
    return `translateX(-${this.activeShowcaseSlides[showcaseIndex] * 100}%)`;
  }

  private startAutoSlide() {
    this.autoSlideTimer = setInterval(() => {
      this.showcaseSlides.forEach((_, showcaseIndex) => {
        this.moveShowcaseSlideWithoutReset(showcaseIndex, 1);
      });
    }, 3000);
  }

  private stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  private restartAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  private moveShowcaseSlideWithoutReset(showcaseIndex: number, direction: number) {
    const slidesLength = this.showcaseSlides[showcaseIndex].length;

    this.activeShowcaseSlides[showcaseIndex] =
      (this.activeShowcaseSlides[showcaseIndex] + direction + slidesLength) %
      slidesLength;
  }

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
