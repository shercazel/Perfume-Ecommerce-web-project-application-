import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandCollection } from './brand-collection';

describe('BrandCollection', () => {
  let component: BrandCollection;
  let fixture: ComponentFixture<BrandCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
