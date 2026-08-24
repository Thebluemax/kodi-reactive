import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { LibraryKodiRepository } from './library-kodi.repository';
import { LibraryType } from '../../domain/entities/library-type.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';

describe('LibraryKodiRepository', () => {
  let repository: LibraryKodiRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: KodiConfigService, useValue: { jsonRpcUrl: JSON_RPC_URL } }
      ]
    });

    repository = TestBed.inject(LibraryKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  // ========================================================================
  // Mapeo de tipo de biblioteca a método JSON-RPC
  // ========================================================================

  const cases: {
    description: string;
    run: () => void;
    expectedMethod: Methods;
  }[] = [
    {
      description: 'AudioLibrary.Scan',
      run: () => repository.scan(LibraryType.Audio).subscribe(),
      expectedMethod: Methods.AudioLibraryScan
    },
    {
      description: 'VideoLibrary.Scan',
      run: () => repository.scan(LibraryType.Video).subscribe(),
      expectedMethod: Methods.VideoLibraryScan
    },
    {
      description: 'AudioLibrary.Clean',
      run: () => repository.clean(LibraryType.Audio).subscribe(),
      expectedMethod: Methods.AudioLibraryClean
    },
    {
      description: 'VideoLibrary.Clean',
      run: () => repository.clean(LibraryType.Video).subscribe(),
      expectedMethod: Methods.VideoLibraryClean
    }
  ];

  cases.forEach(({ description, run, expectedMethod }) => {
    it(`should post ${description} to the configured JSON-RPC endpoint`, () => {
      run();

      const request = httpMock.expectOne(JSON_RPC_URL);

      expect(request.request.method).toBe('POST');
      expect(request.request.body.jsonrpc).toBe('2.0');
      expect(request.request.body.method).toBe(expectedMethod);

      request.flush({ id: 1, result: 'OK' });
    });
  });

  // ========================================================================
  // Contrato JSON-RPC
  // ========================================================================

  it('should increment the request id on every command', () => {
    repository.scan(LibraryType.Audio).subscribe();
    const first = httpMock.expectOne(JSON_RPC_URL);
    const firstId = first.request.body.id;
    first.flush({ id: firstId, result: 'OK' });

    repository.clean(LibraryType.Video).subscribe();
    const second = httpMock.expectOne(JSON_RPC_URL);
    const secondId = second.request.body.id;
    second.flush({ id: secondId, result: 'OK' });

    expect(secondId).toBe(firstId + 1);
  });

  it('should complete without a value when Kodi accepts the command', () => {
    const next = jasmine.createSpy('next');
    const complete = jasmine.createSpy('complete');

    repository.scan(LibraryType.Audio).subscribe({ next, complete });

    httpMock.expectOne(JSON_RPC_URL).flush({ id: 1, result: 'OK' });

    expect(next).toHaveBeenCalledOnceWith(undefined);
    expect(complete).toHaveBeenCalledWith();
  });

  // Kodi devuelve HTTP 200 aunque el JSON-RPC falle: el error viaja en el body
  it('should fail when the body carries a JSON-RPC error despite HTTP 200', () => {
    const error = jasmine.createSpy('error');

    repository.scan(LibraryType.Audio).subscribe({ error });

    httpMock
      .expectOne(JSON_RPC_URL)
      .flush({ id: 1, error: { code: -32601, message: 'Method not found' } });

    expect(error).toHaveBeenCalledWith(jasmine.any(Error));
    // El mensaje lo compone ahora el cliente compartido, y lleva ademas el
    // codigo, que es con lo que se busca un fallo concreto de Kodi.
    const message = (error.calls.mostRecent().args[0] as Error).message;

    expect(message).toContain(Methods.AudioLibraryScan);
    expect(message).toContain('Method not found');
    expect(message).toContain('-32601');
  });

  it('should propagate transport errors', () => {
    const error = jasmine.createSpy('error');

    repository.clean(LibraryType.Video).subscribe({ error });

    httpMock
      .expectOne(JSON_RPC_URL)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(error).toHaveBeenCalledWith(jasmine.anything());
  });
});
