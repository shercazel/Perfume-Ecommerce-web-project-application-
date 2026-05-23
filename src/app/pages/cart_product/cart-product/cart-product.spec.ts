import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartProduct } from './cart-product';

describe('CartProduct', () => {
  let component: CartProduct;
  let fixture: ComponentFixture<CartProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
