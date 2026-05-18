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
      questionTitle: 'When you inhale Sherwin, which environment feels most like "you"?',
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
  ];
}
