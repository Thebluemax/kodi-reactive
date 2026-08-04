import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { CleanLibraryUseCase } from './clean-library.use-case';
import { LibraryRepository } from '../../domain/repositories/library.repository';
import { LibraryType } from '../../domain/entities/library-type.entity';

describe('CleanLibraryUseCase', () => {
  let useCase: CleanLibraryUseCase;

  const mockLibraryRepository = {
    scan: jasmine.createSpy('scan').and.returnValue(of(void 0)),
    clean: jasmine.createSpy('clean').and.returnValue(of(void 0))
  };

  beforeEach(() => {
    mockLibraryRepository.clean.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: LibraryRepository, useValue: mockLibraryRepository }
      ]
    });
    useCase = TestBed.inject(CleanLibraryUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should delegate the audio clean to the repository', () => {
    useCase.execute(LibraryType.Audio).subscribe();

    expect(mockLibraryRepository.clean).toHaveBeenCalledOnceWith(LibraryType.Audio);
  });

  it('should delegate the video clean to the repository', () => {
    useCase.execute(LibraryType.Video).subscribe();

    expect(mockLibraryRepository.clean).toHaveBeenCalledOnceWith(LibraryType.Video);
  });
});
