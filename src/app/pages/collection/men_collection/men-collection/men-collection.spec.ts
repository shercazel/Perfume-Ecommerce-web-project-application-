import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenCollection } from './men-collection';

describe('MenCollection', () => {
  let component: MenCollection;
  let fixture: ComponentFixture<MenCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
