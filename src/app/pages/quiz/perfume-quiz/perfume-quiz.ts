import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { CartProductItem, CartService } from '../../../services/cart-service';

type ScentProfile = 'fresh' | 'romance' | 'bold' | 'sweet';

interface QuizChoice {
  choiceText: string;
  choiceImage: string;
  profile: ScentProfile;
}

interface QuizQuestion {
  questionNumber: string;
  questionTitle: string;
  choices: QuizChoice[];
}

type RankedRecommendation = CartProductItem & {
  reason: string;
  notes: string;
  profile: ScentProfile;
  score: number;
};

@Component({
  selector: 'app-perfume-quiz',
  imports: [CurrencyPipe],
  templateUrl: './perfume-quiz.html',
  styleUrl: './perfume-quiz.css',
})
export class PerfumeQuiz {
  constructor(private readonly cartService: CartService) {}

  qContent: QuizQuestion[] = [
    {
      questionNumber: 'QUESTION 1 OUT OF 5',
      questionTitle: 'Which scent mood feels most like you?',
      choices: [
        {
          choiceText: 'Natural & Fresh',
          choiceImage:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
          profile: 'fresh',
        },
        {
          choiceText: 'Soft & Gentle',
          choiceImage:
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
          profile: 'romance',
        },
        {
          choiceText: 'Bold & Intense',
          choiceImage:
            'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200&auto=format&fit=crop',
          profile: 'bold',
        },
        {
          choiceText: 'Warm & Familiar',
          choiceImage:
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop',
          profile: 'sweet',
        },
      ],
    },
    {
      questionNumber: 'QUESTION 2 OUT OF 5',
      questionTitle: 'Where would you most likely wear your perfume?',
      choices: [
        {
          choiceText: 'Daily Errands',
          choiceImage:
            'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1200&auto=format&fit=crop',
          profile: 'fresh',
        },
        {
          choiceText: 'Office Days',
          choiceImage:
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
          profile: 'fresh',
        },
        {
          choiceText: 'Date Nights',
          choiceImage:
            'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop',
          profile: 'romance',
        },
        {
          choiceText: 'Special Events',
          choiceImage:
            'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop',
          profile: 'bold',
        },
      ],
    },
    {
      questionNumber: 'QUESTION 3 OUT OF 5',
      questionTitle: 'What kind of scent trail do you want to leave?',
      choices: [
        {
          choiceText: 'Light & Clean',
          choiceImage:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
          profile: 'fresh',
        },
        {
          choiceText: 'Sweet & Noticeable',
          choiceImage:
            'https://images.unsplash.com/photo-1481391319762-47dff72954d9?q=80&w=1200&auto=format&fit=crop',
          profile: 'sweet',
        },
        {
          choiceText: 'Deep & Mysterious',
          choiceImage:
            'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1200&auto=format&fit=crop',
          profile: 'bold',
        },
        {
          choiceText: 'Elegant & Soft',
          choiceImage:
            'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1200&auto=format&fit=crop',
          profile: 'romance',
        },
      ],
    },
    {
      questionNumber: 'QUESTION 4 OUT OF 5',
      questionTitle: 'Which note sounds most attractive to you?',
      choices: [
        {
          choiceText: 'Citrus',
          choiceImage:
            'https://images.unsplash.com/photo-1590502593747-42a996133562?q=80&w=1200&auto=format&fit=crop',
          profile: 'fresh',
        },
        {
          choiceText: 'Vanilla',
          choiceImage:
            'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=1200&auto=format&fit=crop',
          profile: 'sweet',
        },
        {
          choiceText: 'Woody',
          choiceImage:
            'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop',
          profile: 'bold',
        },
        {
          choiceText: 'Floral',
          choiceImage:
            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200&auto=format&fit=crop',
          profile: 'romance',
        },
      ],
    },
    {
      questionNumber: 'QUESTION 5 OUT OF 5',
      questionTitle: 'How strong do you want your perfume to feel?',
      choices: [
        {
          choiceText: 'Barely There',
          choiceImage:
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
          profile: 'fresh',
        },
        {
          choiceText: 'Balanced',
          choiceImage:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
          profile: 'romance',
        },
        {
          choiceText: 'Long Lasting',
          choiceImage:
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
          profile: 'sweet',
        },
        {
          choiceText: 'Room Filling',
          choiceImage:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
          profile: 'bold',
        },
      ],
    },
  ];

  recommendations: Record<ScentProfile, CartProductItem & { reason: string; notes: string }> = {
    fresh: {
      id: 'quiz-fresh-morning',
      perfName: 'Fresh Morning',
      description: 'Clean citrus perfume for daily wear',
      imagePath: 'assets/images/carouselImage/perfBlue.png',
      size: '50mL',
      price: 79,
      originalPrice: 99,
      discountRate: 0.2,
      reason: 'Your answers lean clean, light, and easy to wear.',
      notes: 'Citrus, airy musk, soft green notes',
    },
    romance: {
      id: 'quiz-romance-rose',
      perfName: 'Romance Rose',
      description: 'Soft floral perfume for date nights',
      imagePath: 'assets/images/carouselImage/romanceImg.svg',
      size: '50mL',
      price: 89,
      originalPrice: 119,
      discountRate: 0.25,
      reason: 'Your choices point to something gentle, elegant, and memorable.',
      notes: 'Rose, peony, vanilla musk',
    },
    bold: {
      id: 'quiz-midnight-bold',
      perfName: 'Midnight Bold',
      description: 'Deep woody scent with strong projection',
      imagePath: 'assets/images/carouselImage/honeyPerf.svg',
      size: '50mL',
      price: 99,
      originalPrice: 129,
      discountRate: 0.23,
      reason: 'You prefer strong, confident scents that leave a clear impression.',
      notes: 'Woods, amber, spice',
    },
    sweet: {
      id: 'quiz-sweet-bloom',
      perfName: 'Sweet Bloom',
      description: 'Warm sweet perfume with cozy character',
      imagePath: 'assets/images/carouselImage/honeyPerf.svg',
      size: '30mL',
      price: 69,
      originalPrice: 89,
      discountRate: 0.22,
      reason: 'Your answers match warm, familiar, and noticeable scents.',
      notes: 'Vanilla, honey, soft florals',
    },
  };

  currentQuestionIndex = 0;
  selectedChoices: (number | null)[] = Array(this.qContent.length).fill(null);
  showResult = false;
  recommendedProfile: ScentProfile = 'fresh';
  rankedRecommendations: RankedRecommendation[] = [];

  get currentQuestion() {
    return this.qContent[this.currentQuestionIndex];
  }

  get selectedChoice() {
    return this.selectedChoices[this.currentQuestionIndex];
  }

  get recommendedPerfume() {
    return this.recommendations[this.recommendedProfile];
  }

  get dominantRecommendation() {
    return this.rankedRecommendations[0] ?? {
      ...this.recommendedPerfume,
      profile: this.recommendedProfile,
      score: 0,
    };
  }

  get alternativeRecommendations() {
    return this.rankedRecommendations.slice(1, 4);
  }

  selectChoice(choiceIndex: number) {
    this.selectedChoices[this.currentQuestionIndex] = choiceIndex;
  }

  nextQuestion() {
    if (this.selectedChoice === null) {
      return;
    }

    if (this.currentQuestionIndex === this.qContent.length - 1) {
      this.rankedRecommendations = this.calculateRankedRecommendations();
      this.recommendedProfile = this.rankedRecommendations[0].profile;
      this.showResult = true;
      return;
    }

    this.currentQuestionIndex++;
  }

  previousQuestion() {
    if (this.showResult) {
      this.showResult = false;
      return;
    }

    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedChoices = Array(this.qContent.length).fill(null);
    this.showResult = false;
    this.recommendedProfile = 'fresh';
    this.rankedRecommendations = [];
  }

  addRecommendationToCart(product: CartProductItem = this.dominantRecommendation) {
    this.cartService.addToCart(product);
  }

  private calculateRankedRecommendations(): RankedRecommendation[] {
    const scores: Record<ScentProfile, number> = {
      fresh: 0,
      romance: 0,
      bold: 0,
      sweet: 0,
    };

    this.selectedChoices.forEach((choiceIndex, questionIndex) => {
      if (choiceIndex === null) {
        return;
      }

      scores[this.qContent[questionIndex].choices[choiceIndex].profile]++;
    });

    return (Object.entries(scores) as [ScentProfile, number][])
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([profile, score]) => ({
        ...this.recommendations[profile],
        profile,
        score,
      }));
  }
}
