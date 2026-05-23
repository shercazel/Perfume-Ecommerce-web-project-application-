import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCartContainer } from './add-to-cart-container';

describe('AddToCartContainer', () => {
  let component: AddToCartContainer;
  let fixture: ComponentFixture<AddToCartContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToCartContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToCartContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
