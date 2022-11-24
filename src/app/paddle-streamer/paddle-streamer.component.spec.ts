import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaddleStreamerComponent } from './paddle-streamer.component';

describe('PaddleStreamerComponent', () => {
  let component: PaddleStreamerComponent;
  let fixture: ComponentFixture<PaddleStreamerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaddleStreamerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaddleStreamerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
