import { TestBed } from '@angular/core/testing';

import { SideBarService } from './side-bar.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SideBarService', () => {
  let service: SideBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(SideBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
