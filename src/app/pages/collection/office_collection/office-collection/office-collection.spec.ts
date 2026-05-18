import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeCollection } from './office-collection';

describe('OfficeCollection', () => {
  let component: OfficeCollection;
  let fixture: ComponentFixture<OfficeCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
