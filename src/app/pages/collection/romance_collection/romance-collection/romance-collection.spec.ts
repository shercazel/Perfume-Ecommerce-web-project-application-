import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RomanceCollection } from './romance-collection';

describe('RomanceCollection', () => {
  let component: RomanceCollection;
  let fixture: ComponentFixture<RomanceCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RomanceCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RomanceCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
