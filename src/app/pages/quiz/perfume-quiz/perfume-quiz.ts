import { Component } from '@angular/core';

@Component({
  selector: 'app-perfume-quiz',
  imports: [],
  templateUrl: './perfume-quiz.html',
  styleUrl: './perfume-quiz.css',
})
export class PerfumeQuiz {
  qContent = [
    {
      questionNumber: 'QUESTION 1 OUT OF 5',
      questionTitle: 'Which scent mood feels most like you?',
      choices: [
        {
          choiceText: 'Natural & Fresh',
          choiceImage:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Soft & Gentle',
          choiceImage:
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Bold & Intense',
          choiceImage:
            'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Warm & Familiar',
          choiceImage:
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop',
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
        },
        {
          choiceText: 'Office Days',
          choiceImage:
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Date Nights',
          choiceImage:
            'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Special Events',
          choiceImage:
            'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop',
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
        },
        {
          choiceText: 'Sweet & Noticeable',
          choiceImage:
            'https://images.unsplash.com/photo-1481391319762-47dff72954d9?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Deep & Mysterious',
          choiceImage:
            'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Elegant & Soft',
          choiceImage:
            'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1200&auto=format&fit=crop',
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
        },
        {
          choiceText: 'Vanilla',
          choiceImage:
            'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Woody',
          choiceImage:
            'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Floral',
          choiceImage:
            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200&auto=format&fit=crop',
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
        },
        {
          choiceText: 'Balanced',
          choiceImage:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Long Lasting',
          choiceImage:
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
        },
        {
          choiceText: 'Room Filling',
          choiceImage:
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
        },
      ],
    },
  ];

  currentQuestionIndex = 0;
  selectedChoices: (number | null)[] = Array(this.qContent.length).fill(null);
  showResult = false;

  get currentQuestion() {
    return this.qContent[this.currentQuestionIndex];
  }

  get selectedChoice() {
    return this.selectedChoices[this.currentQuestionIndex];
  }

  selectChoice(choiceIndex: number) {
    this.selectedChoices[this.currentQuestionIndex] = choiceIndex;
  }

  nextQuestion() {
    if (this.selectedChoice === null) {
      return;
    }

    if (this.currentQuestionIndex === this.qContent.length - 1) {
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
  }
}
