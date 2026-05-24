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

  heroBackgroundImage = 'assets/Background/homeHeroBg.png';
  activeShowcaseSlides = [0, 0, 0, 0, 0];
  private autoSlideTimer?: ReturnType<typeof setInterval>;

  readonly infiniteCarouselImages = [
    {
      id: 'home-carousel-image-1',
      imagePath: 'assets/images/carosuelsahome/image1.png',
      alt: 'Featured perfume carousel image 1',
    },
    {
      id: 'home-carousel-image-2',
      imagePath: 'assets/images/carosuelsahome/img2.png',
      alt: 'Featured perfume carousel image 2',
    },
    {
      id: 'home-carousel-image-4',
      imagePath: 'assets/images/carosuelsahome/img4.png',
      alt: 'Featured perfume carousel image 4',
    },
    {
      id: 'home-carousel-image-5',
      imagePath: 'assets/images/carosuelsahome/img5.png',
      alt: 'Featured perfume carousel image 5',
    },
    {
      id: 'home-carousel-flower-1',
      imagePath: 'assets/images/carosuelsahome/Flower1.png',
      alt: 'Flower perfume carousel image',
    },
    {
      id: 'home-carousel-people-2',
      imagePath: 'assets/images/carosuelsahome/People2.png',
      alt: 'Lifestyle perfume carousel image',
    },
    {
      id: 'home-carousel-reed-1',
      imagePath: 'assets/images/carosuelsahome/Reed1.png',
      alt: 'Reed perfume carousel image',
    },
    {
      id: 'home-carousel-verte-1',
      imagePath: 'assets/images/carosuelsahome/Verte1.png',
      alt: 'Verte perfume carousel image',
    },
    {
      id: 'home-carousel-vstease-1',
      imagePath: 'assets/images/carosuelsahome/vstease1.png',
      alt: 'Vstease perfume carousel image',
    },
  ];
  readonly galleryImages = [
    ...this.infiniteCarouselImages,
    ...this.infiniteCarouselImages,
  ];
  readonly showcaseSlides = [
    [
      {
        image: 'assets/images/carosuelsahome/Flower1.png',
        alt: 'Flower perfume showcase 1',
      },
      {
        image: 'assets/images/carosuelsahome/Flower2.png',
        alt: 'Flower perfume showcase 2',
      },
      {
        image: 'assets/images/carosuelsahome/Flower3.png',
        alt: 'Flower perfume showcase 3',
      },
    ],
    [
      {
        image: 'assets/images/carosuelsahome/People2.png',
        alt: 'People perfume showcase 1',
      },
      {
        image: 'assets/images/carosuelsahome/People3.png',
        alt: 'People perfume showcase 2',
      },
      {
        image: 'assets/images/carosuelsahome/Peoplenight1.png',
        alt: 'Night perfume showcase',
      },
    ],
    [
      {
        image: 'assets/images/carosuelsahome/Reed1.png',
        alt: 'Reed perfume showcase 1',
      },
      {
        image: 'assets/images/carosuelsahome/Reed2.png',
        alt: 'Reed perfume showcase 2',
      },
      {
        image: 'assets/images/carosuelsahome/Reed3.png',
        alt: 'Reed perfume showcase 3',
      },
    ],
    [
      {
        image: 'assets/images/carosuelsahome/Verte1.png',
        alt: 'Verte perfume showcase 1',
      },
      {
        image: 'assets/images/carosuelsahome/verte3.png',
        alt: 'Verte perfume showcase 2',
      },
      {
        image: 'assets/images/carosuelsahome/HermesA.png',
        alt: 'Hermes perfume showcase',
      },
    ],
    [
      {
        image: 'assets/images/carosuelsahome/vstease1.png',
        alt: 'Vstease perfume showcase 1',
      },
      {
        image: 'assets/images/carosuelsahome/vstease2.png',
        alt: 'Vstease perfume showcase 2',
      },
      {
        image: 'assets/images/carosuelsahome/vstease3.png',
        alt: 'Vstease perfume showcase 3',
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
      imagePath:
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80',
      cardNumber: '01',
    },
    {
      cardsTitle: 'Long-Lasting Performance',
      cardsDescription:
        'Our perfumes are crafted to stay with you for hours, delivering a consistent and elegant scent from day to night.',
      imagePath:
        'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=300&q=80',
      cardNumber: '02',
    },
    {
      cardsTitle: 'Premium Perfume Selection',
      cardsDescription:
        'Discover carefully curated perfumes made with high-quality fragrance oils for a luxurious scent experience.',
      imagePath:
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=300&q=80',
      cardNumber: '03',
    },
  ];
}
