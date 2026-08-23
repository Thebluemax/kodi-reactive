import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { KodiConfigService } from './kodi-config.service';

const WS_PORT_STORAGE_KEY = 'kodi-ws-port';

/**
 * Regresion de #195: la configuracion `ci` compilaba y testeaba con el archivo
 * base de entornos, que declaraba `production: true` con valores de desarrollo.
 * El servicio tomaba entonces la rama de `window.location`, que bajo Karma es el
 * servidor de Karma. Estos specs inyectan el servicio real —sin sustituirlo— para
 * fijar que local y CI resuelven lo mismo.
 */
describe('KodiConfigService', () => {
  let service: KodiConfigService;

  beforeEach(() => {
    localStorage.removeItem(WS_PORT_STORAGE_KEY);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(KodiConfigService);
  });

  afterEach(() => {
    localStorage.removeItem(WS_PORT_STORAGE_KEY);
  });

  it('resuelve los puertos del entorno de tests, no los de window.location', () => {
    // Karma sirve en localhost, asi que el host no distingue: lo que delata la
    // rama de produccion es el puerto, que seria el del servidor de Karma.
    expect(service.host).toBe('localhost');
    expect(service.httpPort).toBe(8080);
    expect(service.httpPort).not.toBe(Number(window.location.port));
  });

  it('apunta el JSON-RPC al proxy de desarrollo', () => {
    expect(service.jsonRpcUrl).toBe('http://localhost:8008/jsonrpc');
  });

  it('compone la base HTTP con el puerto de Kodi', () => {
    expect(service.httpBaseUrl).toBe('http://localhost:8080');
  });

  it('cae al puerto WS del entorno cuando no hay nada guardado', () => {
    expect(service.wsPort()).toBe(9090);
    expect(service.wsUrl()).toBe('ws://localhost:9090/jsonrpc');
  });

  it('prefiere el puerto WS guardado en localStorage', () => {
    localStorage.setItem(WS_PORT_STORAGE_KEY, '9999');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    expect(TestBed.inject(KodiConfigService).wsUrl()).toBe('ws://localhost:9999/jsonrpc');
  });
});
