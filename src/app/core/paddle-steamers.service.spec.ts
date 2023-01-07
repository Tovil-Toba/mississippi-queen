import { TestBed } from '@angular/core/testing';

import { PaddleSteamersService } from './paddle-steamers.service';

describe('PaddleSteamersService', () => {
  let service: PaddleSteamersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaddleSteamersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
