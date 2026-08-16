import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';

import { LibraryFacade } from './library.facade';
import { ScanLibraryUseCase } from './use-cases/scan-library.use-case';
import { CleanLibraryUseCase } from './use-cases/clean-library.use-case';
import { LibraryWebSocketAdapter } from '../infrastructure/adapters/library-websocket.adapter';
import { LibraryType, LibraryOperation } from '../domain/entities/library-type.entity';
import { LibraryEvent, LibraryEventPhase } from '../domain/entities/library-event.entity';

const SAFETY_TIMEOUT_MS = 10 * 60 * 1000;

describe('LibraryFacade', () => {
  let facade: LibraryFacade;
  let eventSubject: Subject<LibraryEvent>;
  let errorSubject: Subject<Error>;

  let mockScanUseCase: { execute: jasmine.Spy };
  let mockCleanUseCase: { execute: jasmine.Spy };
  let mockWebSocket: {
    connect: jasmine.Spy;
    disconnect: jasmine.Spy;
    getEventStream: () => Subject<LibraryEvent>;
    getErrorStream: () => Subject<Error>;
  };

  const emit = (
    type: LibraryType,
    operation: LibraryOperation,
    phase: LibraryEventPhase
  ): void => eventSubject.next({ type, operation, phase });

  const configure = (): void => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ScanLibraryUseCase, useValue: mockScanUseCase },
        { provide: CleanLibraryUseCase, useValue: mockCleanUseCase },
        { provide: LibraryWebSocketAdapter, useValue: mockWebSocket }
      ]
    });

    facade = TestBed.inject(LibraryFacade);
  };

  beforeEach(() => {
    eventSubject = new Subject<LibraryEvent>();
    errorSubject = new Subject<Error>();

    mockScanUseCase = {
      execute: jasmine.createSpy('scan').and.returnValue(of(void 0))
    };
    mockCleanUseCase = {
      execute: jasmine.createSpy('clean').and.returnValue(of(void 0))
    };
    mockWebSocket = {
      connect: jasmine.createSpy('connect'),
      disconnect: jasmine.createSpy('disconnect'),
      getEventStream: () => eventSubject,
      getErrorStream: () => errorSubject
    };

    configure();
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should start with no operation running', () => {
    expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeFalse();
    expect(facade.isBusy(LibraryType.Audio)).toBeFalse();
    expect(facade.lastError()).toBeNull();
    expect(facade.lastFinished()).toBeNull();
  });

  // ========================================================================
  // Conexión
  // ========================================================================

  it('should delegate connect and disconnect to the adapter', () => {
    facade.connect();
    facade.disconnect();

    expect(mockWebSocket.connect).toHaveBeenCalled();
    expect(mockWebSocket.disconnect).toHaveBeenCalled();
  });

  // ========================================================================
  // Comandos
  // ========================================================================

  it('should run the scan use case', () => {
    facade.scan(LibraryType.Audio);

    expect(mockScanUseCase.execute).toHaveBeenCalledOnceWith(LibraryType.Audio);
  });

  it('should run the clean use case', () => {
    facade.clean(LibraryType.Video);

    expect(mockCleanUseCase.execute).toHaveBeenCalledOnceWith(LibraryType.Video);
  });

  // Kodi tarda en enviar OnScanStarted, así que el estado se marca al disparar
  it('should mark the operation as running optimistically', () => {
    facade.scan(LibraryType.Audio);

    expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeTrue();
    expect(facade.isBusy(LibraryType.Audio)).toBeTrue();
  });

  it('should keep operations isolated per type and per operation', () => {
    facade.scan(LibraryType.Audio);

    expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Clean)).toBeFalse();
    expect(facade.isRunning(LibraryType.Video, LibraryOperation.Scan)).toBeFalse();
    expect(facade.isBusy(LibraryType.Video)).toBeFalse();
  });

  it('should ignore a second command while the same one is running', () => {
    facade.scan(LibraryType.Audio);
    facade.scan(LibraryType.Audio);

    expect(mockScanUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should allow a new command once the previous one finished', () => {
    facade.scan(LibraryType.Audio);
    emit(LibraryType.Audio, LibraryOperation.Scan, LibraryEventPhase.Finished);
    facade.scan(LibraryType.Audio);

    expect(mockScanUseCase.execute).toHaveBeenCalledTimes(2);
  });

  // ========================================================================
  // Eventos del WebSocket
  // ========================================================================

  it('should mark the operation as running on a started event', () => {
    emit(LibraryType.Video, LibraryOperation.Scan, LibraryEventPhase.Started);

    expect(facade.isRunning(LibraryType.Video, LibraryOperation.Scan)).toBeTrue();
    expect(facade.lastFinished()).toBeNull();
  });

  it('should clear the operation and publish it on a finished event', () => {
    facade.clean(LibraryType.Video);
    emit(LibraryType.Video, LibraryOperation.Clean, LibraryEventPhase.Finished);

    expect(facade.isRunning(LibraryType.Video, LibraryOperation.Clean)).toBeFalse();
    expect(facade.lastFinished()).toEqual({
      type: LibraryType.Video,
      operation: LibraryOperation.Clean,
      phase: LibraryEventPhase.Finished
    });
  });

  it('should not clear an operation when a different one finishes', () => {
    facade.scan(LibraryType.Audio);
    emit(LibraryType.Video, LibraryOperation.Scan, LibraryEventPhase.Finished);

    expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeTrue();
  });

  // ========================================================================
  // Errores
  // ========================================================================

  it('should release the operation and expose the error when the command fails', () => {
    mockScanUseCase.execute.and.returnValue(throwError(() => new Error('Kodi caído')));

    facade.scan(LibraryType.Audio);

    expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeFalse();
    expect(facade.lastError()).toBe('Kodi caído');
  });

  it('should expose errors coming from the adapter', () => {
    errorSubject.next(new Error('Library WebSocket error'));

    expect(facade.lastError()).toBe('Library WebSocket error');
  });

  it('should clear the error and the finished operation on demand', () => {
    errorSubject.next(new Error('boom'));
    emit(LibraryType.Audio, LibraryOperation.Scan, LibraryEventPhase.Finished);

    facade.clearError();
    facade.clearFinished();

    expect(facade.lastError()).toBeNull();
    expect(facade.lastFinished()).toBeNull();
  });

  // ========================================================================
  // Timeout de seguridad
  // ========================================================================
  // El proyecto corre zoneless (zone.js no se carga en polyfills), así que
  // fakeAsync/tick no están disponibles: los timers se controlan con el reloj
  // de Jasmine.
  // ========================================================================

  describe('safety timeout', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should release the operation if Kodi never notifies the end', () => {
      facade.scan(LibraryType.Audio);

      jasmine.clock().tick(SAFETY_TIMEOUT_MS - 1);

      expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeTrue();

      jasmine.clock().tick(1);

      expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeFalse();
    });

    it('should cancel the safety timer once the operation finishes', () => {
      facade.scan(LibraryType.Audio);
      emit(LibraryType.Audio, LibraryOperation.Scan, LibraryEventPhase.Finished);

      // Si el timer siguiese vivo volvería a limpiar un estado ya limpio; lo que
      // se comprueba es que un rearranque posterior no lo hereda.
      facade.scan(LibraryType.Audio);
      jasmine.clock().tick(SAFETY_TIMEOUT_MS - 1);

      expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeTrue();
    });

    it('should restart the safety timer when Kodi confirms the start', () => {
      facade.scan(LibraryType.Audio);

      jasmine.clock().tick(SAFETY_TIMEOUT_MS / 2);
      emit(LibraryType.Audio, LibraryOperation.Scan, LibraryEventPhase.Started);

      jasmine.clock().tick(SAFETY_TIMEOUT_MS / 2);

      expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeTrue();

      jasmine.clock().tick(SAFETY_TIMEOUT_MS / 2);

      expect(facade.isRunning(LibraryType.Audio, LibraryOperation.Scan)).toBeFalse();
    });
  });
});
