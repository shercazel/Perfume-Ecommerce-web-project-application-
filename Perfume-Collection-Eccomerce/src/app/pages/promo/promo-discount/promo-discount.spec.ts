import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoDiscount } from './promo-discount';

describe('PromoDiscount', () => {
  let component: PromoDiscount;
  let fixture: ComponentFixture<PromoDiscount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoDiscount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoDiscount);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
