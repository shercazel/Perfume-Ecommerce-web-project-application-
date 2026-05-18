import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreshCollection } from './fresh-collection';

describe('FreshCollection', () => {
  let component: FreshCollection;
  let fixture: ComponentFixture<FreshCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreshCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreshCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
