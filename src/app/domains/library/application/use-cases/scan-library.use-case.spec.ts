import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { ScanLibraryUseCase } from './scan-library.use-case';
import { LibraryRepository } from '../../domain/repositories/library.repository';
import { LibraryType } from '../../domain/entities/library-type.entity';

describe('ScanLibraryUseCase', () => {
  let useCase: ScanLibraryUseCase;

  const mockLibraryRepository = {
    scan: jasmine.createSpy('scan').and.returnValue(of(void 0)),
    clean: jasmine.createSpy('clean').and.returnValue(of(void 0))
  };

  beforeEach(() => {
    mockLibraryRepository.scan.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: LibraryRepository, useValue: mockLibraryRepository }
      ]
    });
    useCase = TestBed.inject(ScanLibraryUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should delegate the audio scan to the repository', () => {
    useCase.execute(LibraryType.Audio).subscribe();

    expect(mockLibraryRepository.scan).toHaveBeenCalledOnceWith(LibraryType.Audio);
  });

  it('should delegate the video scan to the repository', () => {
    useCase.execute(LibraryType.Video).subscribe();

    expect(mockLibraryRepository.scan).toHaveBeenCalledOnceWith(LibraryType.Video);
  });
});
