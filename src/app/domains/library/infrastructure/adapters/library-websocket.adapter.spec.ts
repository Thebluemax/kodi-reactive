import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { LibraryWebSocketAdapter } from './library-websocket.adapter';
import { KodiSocketService } from '@shared/services/kodi-socket.service';
import { Methods } from '@shared/enums/methods';
import { LibraryType, LibraryOperation } from '../../domain/entities/library-type.entity';
import { LibraryEvent, LibraryEventPhase } from '../../domain/entities/library-event.entity';

/**
 * El adapter ya no abre el socket: lo hace KodiSocketService, que es quien
 * reconecta. Aqui solo se comprueba que traduce lo que llega.
 */
describe('LibraryWebSocketAdapter', () => {
  let adapter: LibraryWebSocketAdapter;
  let messages: Subject<unknown>;
  let socket: {
    messages$: Subject<unknown>;
    isConnected: ReturnType<typeof signal<boolean>>;
    connected$: Subject<boolean>;
    acquire: jasmine.Spy;
    release: jasmine.Spy;
  };

  function notify(payload: unknown): void {
    messages.next(payload);
  }

  beforeEach(() => {
    messages = new Subject<unknown>();
    socket = {
      messages$: messages,
      isConnected: signal(false),
      connected$: new Subject<boolean>(),
      acquire: jasmine.createSpy('acquire'),
      release: jasmine.createSpy('release')
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiSocketService, useValue: socket }
      ]
    });

    adapter = TestBed.inject(LibraryWebSocketAdapter);
  });

  // ========================================================================
  // Conexión
  // ========================================================================

  // ========================================================================
  // Traducción de notificaciones a eventos de dominio
  // ========================================================================

  const notificationCases: {
    method: Methods;
    expected: LibraryEvent;
  }[] = [
    {
      method: Methods.AudioLibraryOnScanStarted,
      expected: {
        type: LibraryType.Audio,
        operation: LibraryOperation.Scan,
        phase: LibraryEventPhase.Started
      }
    },
    {
      method: Methods.AudioLibraryOnScanFinished,
      expected: {
        type: LibraryType.Audio,
        operation: LibraryOperation.Scan,
        phase: LibraryEventPhase.Finished
      }
    },
    {
      method: Methods.AudioLibraryOnCleanStarted,
      expected: {
        type: LibraryType.Audio,
        operation: LibraryOperation.Clean,
        phase: LibraryEventPhase.Started
      }
    },
    {
      method: Methods.AudioLibraryOnCleanFinished,
      expected: {
        type: LibraryType.Audio,
        operation: LibraryOperation.Clean,
        phase: LibraryEventPhase.Finished
      }
    },
    {
      method: Methods.VideoLibraryOnScanStarted,
      expected: {
        type: LibraryType.Video,
        operation: LibraryOperation.Scan,
        phase: LibraryEventPhase.Started
      }
    },
    {
      method: Methods.VideoLibraryOnScanFinished,
      expected: {
        type: LibraryType.Video,
        operation: LibraryOperation.Scan,
        phase: LibraryEventPhase.Finished
      }
    },
    {
      method: Methods.VideoLibraryOnCleanStarted,
      expected: {
        type: LibraryType.Video,
        operation: LibraryOperation.Clean,
        phase: LibraryEventPhase.Started
      }
    },
    {
      method: Methods.VideoLibraryOnCleanFinished,
      expected: {
        type: LibraryType.Video,
        operation: LibraryOperation.Clean,
        phase: LibraryEventPhase.Finished
      }
    }
  ];

  notificationCases.forEach(({ method, expected }) => {
    it(`should translate ${method} into a domain event`, () => {
      const events: LibraryEvent[] = [];
      adapter.getEventStream().subscribe(event => events.push(event));

      adapter.connect();
      notify({ jsonrpc: '2.0', method, params: {} });

      expect(events).toEqual([expected]);
    });
  });

  it('should handle batched notifications', () => {
    const events: LibraryEvent[] = [];
    adapter.getEventStream().subscribe(event => events.push(event));

    adapter.connect();
    notify([
      { method: Methods.AudioLibraryOnScanStarted },
      { method: Methods.AudioLibraryOnScanFinished }
    ]);

    expect(events.length).toBe(2);
    expect(events[0].phase).toBe(LibraryEventPhase.Started);
    expect(events[1].phase).toBe(LibraryEventPhase.Finished);
  });

  it('should ignore notifications outside the library domain', () => {
    const events: LibraryEvent[] = [];
    adapter.getEventStream().subscribe(event => events.push(event));

    adapter.connect();
    notify({ method: Methods.PlayerOnPlay });

    expect(events).toEqual([]);
  });

  it('should ignore messages without a method', () => {
    const events: LibraryEvent[] = [];
    adapter.getEventStream().subscribe(event => events.push(event));

    adapter.connect();
    notify({ id: 1, result: 'OK' });

    expect(events).toEqual([]);
  });

  // ========================================================================
  // Errores
  // ========================================================================

});
