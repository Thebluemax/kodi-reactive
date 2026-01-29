import { TestBed } from '@angular/core/testing';

import { PlaybackFacade } from './playback.facade';

describe('PlaybackFacadeService', () => {
  let service: PlaybackFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaybackFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
