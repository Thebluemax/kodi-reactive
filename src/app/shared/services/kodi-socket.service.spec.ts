import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { KodiSocketService } from './kodi-socket.service';
import { KodiConfigService } from './kodi-config.service';

/** WebSocket de mentira, para poder abrir y cerrar a voluntad. */
class FakeSocket {
  static instances: FakeSocket[] = [];

  // El doble sustituye al WebSocket global, asi que tiene que traer tambien sus
  // constantes: el servicio compara readyState contra ellas.
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState: number = FakeSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readonly sent: string[] = [];
  closed = false;

  constructor(readonly url: string) {
    FakeSocket.instances.push(this);
  }

  send(payload: string): void {
    this.sent.push(payload);
  }

  close(): void {
    this.closed = true;
    this.readyState = FakeSocket.CLOSED;
  }

  simulateOpen(): void {
    this.readyState = FakeSocket.OPEN;
    this.onopen?.();
  }

  simulateClose(): void {
    this.readyState = FakeSocket.CLOSED;
    this.onclose?.();
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

describe('KodiSocketService', () => {
  let service: KodiSocketService;
  let original: typeof WebSocket;

  beforeEach(() => {
    FakeSocket.instances = [];
    original = window.WebSocket;
    (window as unknown as { WebSocket: unknown }).WebSocket = FakeSocket;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: KodiConfigService,
          useValue: { wsUrl: () => 'ws://localhost:9090/jsonrpc' }
        }
      ]
    });

    service = TestBed.inject(KodiSocketService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    (window as unknown as { WebSocket: unknown }).WebSocket = original;
  });

  function last(): FakeSocket {
    return FakeSocket.instances[FakeSocket.instances.length - 1];
  }

  it('abre una sola conexión aunque la pidan varios', () => {
    service.acquire();
    service.acquire();

    expect(FakeSocket.instances.length).toBe(1);
  });

  it('marca la conexión al abrirse', () => {
    service.acquire();
    last().simulateOpen();

    expect(service.isConnected()).toBeTrue();
  });

  it('reparte los mensajes ya parseados', () => {
    const received: unknown[] = [];
    service.messages$.subscribe(m => received.push(m));

    service.acquire();
    last().simulateOpen();
    last().simulateMessage({ method: 'Player.OnPlay' });

    expect(received).toEqual([{ method: 'Player.OnPlay' }]);
  });

  it('un mensaje ilegible no tumba el flujo', () => {
    const received: unknown[] = [];
    service.messages$.subscribe(m => received.push(m));

    service.acquire();
    last().simulateOpen();
    last().onmessage?.({ data: 'esto no es json' });
    last().simulateMessage({ ok: true });

    expect(received).toEqual([{ ok: true }]);
  });

  it('reconecta cuando la conexión se cae', () => {
    // Es el caso que motiva todo: Kodi se reinicia y el reproductor se queda
    // mudo hasta recargar la pagina.
    service.acquire();
    last().simulateOpen();
    last().simulateClose();

    expect(service.isReconnecting()).toBeTrue();

    jasmine.clock().tick(1000);

    expect(FakeSocket.instances.length).toBe(2);
  });

  it('espacia los reintentos en vez de repetirlos sin freno', () => {
    service.acquire();
    last().simulateOpen();

    last().simulateClose();
    jasmine.clock().tick(1000);

    expect(FakeSocket.instances.length).toBe(2);

    last().simulateClose();
    jasmine.clock().tick(1000);

    expect(FakeSocket.instances.length).toBe(2);

    jasmine.clock().tick(1000);

    expect(FakeSocket.instances.length).toBe(3);
  });

  it('vuelve a empezar la espera tras recuperarse', () => {
    service.acquire();
    last().simulateOpen();
    last().simulateClose();
    jasmine.clock().tick(1000);
    last().simulateOpen();

    last().simulateClose();
    jasmine.clock().tick(1000);

    expect(FakeSocket.instances.length).toBe(3);
  });

  it('no reintenta cuando el cierre es a propósito', () => {
    service.acquire();
    last().simulateOpen();

    service.release();
    jasmine.clock().tick(60000);

    expect(FakeSocket.instances.length).toBe(1);
    expect(service.isReconnecting()).toBeFalse();
  });

  it('sigue abierta mientras alguien la use', () => {
    service.acquire();
    service.acquire();
    last().simulateOpen();

    service.release();

    expect(last().closed).toBeFalse();
  });

  it('envía por el socket abierto', () => {
    service.acquire();
    last().simulateOpen();

    expect(service.send({ method: 'Player.GetProperties' })).toBeTrue();
    expect(last().sent.length).toBe(1);
  });

  it('no envía si la conexión está caída', () => {
    service.acquire();

    expect(service.send({ method: 'X' })).toBeFalse();
  });
});
