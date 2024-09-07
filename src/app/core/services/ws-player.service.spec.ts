import { TestBed } from '@angular/core/testing';

import { WsPlayerService } from './ws-player.service';

describe('WsPlayerService', () => {
  let service: WsPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
