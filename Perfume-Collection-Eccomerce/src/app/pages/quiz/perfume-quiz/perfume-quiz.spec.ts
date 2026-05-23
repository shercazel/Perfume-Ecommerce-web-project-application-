import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfumeQuiz } from './perfume-quiz';

describe('PerfumeQuiz', () => {
  let component: PerfumeQuiz;
  let fixture: ComponentFixture<PerfumeQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfumeQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfumeQuiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
