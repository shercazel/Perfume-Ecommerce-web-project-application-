import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WomenCollection } from './women-collection';

describe('WomenCollection', () => {
  let component: WomenCollection;
  let fixture: ComponentFixture<WomenCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WomenCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WomenCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
