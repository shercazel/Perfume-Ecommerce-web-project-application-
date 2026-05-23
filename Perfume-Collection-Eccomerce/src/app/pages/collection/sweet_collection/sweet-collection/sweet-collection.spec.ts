import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SweetCollection } from './sweet-collection';

describe('SweetCollection', () => {
  let component: SweetCollection;
  let fixture: ComponentFixture<SweetCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SweetCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SweetCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
