import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterApp } from './footer-app';

describe('FooterApp', () => {
  let component: FooterApp;
  let fixture: ComponentFixture<FooterApp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterApp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterApp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
