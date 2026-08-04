import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LibraryWebSocketAdapter } from './library-websocket.adapter';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';
import { LibraryType, LibraryOperation } from '../../domain/entities/library-type.entity';
import { LibraryEvent, LibraryEventPhase } from '../../domain/entities/library-event.entity';

const WS_URL = 'ws://localhost:9090/jsonrpc';

/**
 * Doble de WebSocket: el adapter lee WebSocket.OPEN/CONNECTING del global,
 * así que el mock reproduce también las constantes estáticas.
 */
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readyState: number = MockWebSocket.CONNECTING;

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  readonly close = jasmine.createSpy('close').and.callFake(() => {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  });

  constructor(readonly url: string) {
    MockWebSocket.instances.push(this);
  }

  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  simulateRaw(raw: string): void {
    this.onmessage?.({ data: raw });
  }

  simulateNotification(payload: unknown): void {
    this.simulateRaw(JSON.stringify(payload));
  }

  simulateError(): void {
    this.onerror?.();
  }
}

describe('LibraryWebSocketAdapter', () => {
  let adapter: LibraryWebSocketAdapter;
  let originalWebSocket: typeof WebSocket;

  const currentSocket = (): MockWebSocket =>
    MockWebSocket.instances[MockWebSocket.instances.length - 1];

  beforeEach(() => {
    originalWebSocket = window.WebSocket;
    MockWebSocket.instances = [];
    window.WebSocket = MockWebSocket as unknown as typeof WebSocket;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiConfigService, useValue: { wsUrl: () => WS_URL } }
      ]
    });

    adapter = TestBed.inject(LibraryWebSocketAdapter);
  });

  afterEach(() => {
    window.WebSocket = originalWebSocket;
  });

  it('should be created', () => {
    expect(adapter).toBeTruthy();
  });

  // ========================================================================
  // Conexión
  // ========================================================================

  it('should open the socket against the configured url', () => {
    adapter.connect();

    expect(MockWebSocket.instances.length).toBe(1);
    expect(currentSocket().url).toBe(WS_URL);
  });

  it('should not open a second socket while one is open', () => {
    adapter.connect();
    currentSocket().simulateOpen();
    adapter.connect();

    expect(MockWebSocket.instances.length).toBe(1);
  });

  it('should not open a second socket while one is still connecting', () => {
    adapter.connect();
    adapter.connect();

    expect(MockWebSocket.instances.length).toBe(1);
  });

  it('should reopen after a disconnect', () => {
    adapter.connect();
    adapter.disconnect();
    adapter.connect();

    expect(MockWebSocket.instances.length).toBe(2);
  });

  it('should report the connection state', () => {
    const states: boolean[] = [];
    adapter.getConnectionStream().subscribe(state => states.push(state));

    adapter.connect();
    currentSocket().simulateOpen();

    expect(states).toContain(true);

    adapter.disconnect();

    expect(states[states.length - 1]).toBeFalse();
  });

  it('should close the socket on disconnect', () => {
    adapter.connect();
    const socket = currentSocket();

    adapter.disconnect();

    expect(socket.close).toHaveBeenCalled();
  });

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
      currentSocket().simulateNotification({ jsonrpc: '2.0', method, params: {} });

      expect(events).toEqual([expected]);
    });
  });

  it('should handle batched notifications', () => {
    const events: LibraryEvent[] = [];
    adapter.getEventStream().subscribe(event => events.push(event));

    adapter.connect();
    currentSocket().simulateNotification([
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
    currentSocket().simulateNotification({ method: Methods.PlayerOnPlay });

    expect(events).toEqual([]);
  });

  it('should ignore messages without a method', () => {
    const events: LibraryEvent[] = [];
    adapter.getEventStream().subscribe(event => events.push(event));

    adapter.connect();
    currentSocket().simulateNotification({ id: 1, result: 'OK' });

    expect(events).toEqual([]);
  });

  // ========================================================================
  // Errores
  // ========================================================================

  it('should emit an error when the payload is not parseable', () => {
    const errors: Error[] = [];
    adapter.getErrorStream().subscribe(error => errors.push(error));

    adapter.connect();
    currentSocket().simulateRaw('<no-json>');

    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('Library WebSocket: mensaje no parseable');
  });

  it('should emit an error when the socket fails', () => {
    const errors: Error[] = [];
    adapter.getErrorStream().subscribe(error => errors.push(error));

    adapter.connect();
    currentSocket().simulateError();

    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('Library WebSocket error');
  });

  it('should close the socket on destroy', () => {
    adapter.connect();
    const socket = currentSocket();

    adapter.ngOnDestroy();

    expect(socket.close).toHaveBeenCalled();
  });
});
