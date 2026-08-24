import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PlayerKodiRepository } from './player-kodi.repository';
import { PlayerWebSocketAdapter } from '../adapters/player-websocket.adapter';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

describe('PlayerKodiRepository', () => {
  let repository: PlayerKodiRepository;
  let rpc: jasmine.SpyObj<KodiRpcService>;

  beforeEach(() => {
    rpc = jasmine.createSpyObj<KodiRpcService>('KodiRpcService', ['query', 'command']);
    rpc.command.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiRpcService, useValue: rpc },
        { provide: PlayerWebSocketAdapter, useValue: { activePlayerId: 1 } }
      ]
    });

    repository = TestBed.inject(PlayerKodiRepository);
  });

  function sent(): [string, unknown] {
    const args = rpc.command.calls.mostRecent().args;
    return [args[0] as string, args[1]];
  }

  it('dirige las órdenes al reproductor activo', () => {
    // El id sale del adaptador: mandar siempre 0 controlaria el de audio
    // aunque lo que este sonando sea un video.
    repository.playPause().subscribe();

    expect(sent()[1]).toEqual([1, 'toggle']);
  });

  it('manda parar', () => {
    repository.stop().subscribe();

    expect(sent()).toEqual(['Player.Stop', [1]]);
  });

  it('distingue siguiente de anterior', () => {
    repository.nextTrack().subscribe();
    const next = sent()[1];

    repository.previousTrack().subscribe();

    expect(next).toEqual([1, 'next']);
    expect(sent()[1]).toEqual([1, 'previous']);
  });

  it('busca por porcentaje', () => {
    repository.seek(40).subscribe();

    expect(sent()[1]).toEqual([1, { percentage: 40 }]);
  });

  it('acota el volumen al rango que Kodi admite', () => {
    // Kodi rechaza fuera de 0-100, y un control deslizante puede pasarse.
    repository.setVolume(150).subscribe();

    expect(sent()[1]).toEqual([100]);

    repository.setVolume(-20).subscribe();

    expect(sent()[1]).toEqual([0]);
  });

  it('redondea el volumen, que llega con decimales del deslizador', () => {
    repository.setVolume(42.7).subscribe();

    expect(sent()[1]).toEqual([43]);
  });

  it('alterna el silencio sin mandar un valor', () => {
    repository.toggleMute().subscribe();

    expect(sent()[1]).toEqual(['toggle']);
  });

  it('propaga el fallo de una orden', () => {
    rpc.command.and.returnValue(throwError(() => new Error('Kodi dijo que no')));
    let caught: Error | undefined;

    repository.playPause().subscribe({ error: (err: Error) => (caught = err) });

    expect(caught?.message).toBe('Kodi dijo que no');
  });
});
