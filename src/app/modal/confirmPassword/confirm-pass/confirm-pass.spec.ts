import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPass } from './confirm-pass';

describe('ConfirmPass', () => {
  let component: ConfirmPass;
  let fixture: ComponentFixture<ConfirmPass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmPass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmPass);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
