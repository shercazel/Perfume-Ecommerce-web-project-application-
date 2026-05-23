import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoldCollection } from './bold-collection';

describe('BoldCollection', () => {
  let component: BoldCollection;
  let fixture: ComponentFixture<BoldCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoldCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoldCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
