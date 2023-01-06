import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaddleSteamerComponent } from './paddle-steamer.component';

describe('PaddleSteamerComponent', () => {
  let component: PaddleSteamerComponent;
  let fixture: ComponentFixture<PaddleSteamerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaddleSteamerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaddleSteamerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
