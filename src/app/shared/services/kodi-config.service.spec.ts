import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { KodiConfigService } from './kodi-config.service';

const WS_PORT_STORAGE_KEY = 'kodi-ws-port';

/**
 * Regresion de #195: los tests corrian con `production: true`, asi que el
 * servicio tomaba la rama de produccion —la que deriva la conexion de
 * `window.location`— en lugar de la de desarrollo. Ningun spec lo notaba porque
 * todos sustituyen el servicio; estos lo inyectan de verdad para fijar en que
 * modo corre la suite.
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

  it('toma la rama de desarrollo, no la de produccion', () => {
    expect(service.jsonRpcUrl).toBe('http://localhost:8008/jsonrpc');
  });

  it('compone la base HTTP con host y puerto del entorno', () => {
    expect(service.host).toBe('localhost');
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

  it('persiste el puerto WS al cambiarlo', () => {
    service.setWsPort(9091);

    expect(localStorage.getItem(WS_PORT_STORAGE_KEY)).toBe('9091');
    expect(service.wsUrl()).toBe('ws://localhost:9091/jsonrpc');
  });
});
