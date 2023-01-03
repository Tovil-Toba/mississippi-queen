import { TestBed } from '@angular/core/testing';

import { PaddleStreamersService } from './paddle-streamers.service';

describe('PaddleStreamersService', () => {
  let service: PaddleStreamersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaddleStreamersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
