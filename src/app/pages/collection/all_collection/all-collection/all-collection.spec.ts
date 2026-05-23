import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCollection } from './all-collection';

describe('AllCollection', () => {
  let component: AllCollection;
  let fixture: ComponentFixture<AllCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
