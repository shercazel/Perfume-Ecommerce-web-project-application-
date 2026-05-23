import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NightCollection } from './night-collection';

describe('NightCollection', () => {
  let component: NightCollection;
  let fixture: ComponentFixture<NightCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NightCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NightCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
