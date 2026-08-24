import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PlaylistKodiRepository } from './playlist-kodi.repository';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';

describe('PlaylistKodiRepository', () => {
  let repository: PlaylistKodiRepository;
  let rpc: jasmine.SpyObj<KodiRpcService>;

  beforeEach(() => {
    rpc = jasmine.createSpyObj<KodiRpcService>('KodiRpcService', ['query', 'command']);
    rpc.command.and.returnValue(of(void 0));
    rpc.query.and.returnValue(of({ items: [], limits: { total: 0 } }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiRpcService, useValue: rpc }
      ]
    });

    repository = TestBed.inject(PlaylistKodiRepository);
  });

  function commandArgs(): Record<string, unknown> {
    return rpc.command.calls.mostRecent().args[1] as Record<string, unknown>;
  }

  describe('getPlaylist', () => {
    it('devuelve los elementos y el total', () => {
      rpc.query.and.returnValue(
        of({
          items: [{ id: 1, label: 'Una pista', type: 'song' }],
          limits: { total: 1 }
        })
      );

      let total = -1;
      repository.getPlaylist().subscribe(result => (total = result.total));

      expect(total).toBe(1);
    });

    it('acepta una cola vacía, que Kodi devuelve sin items', () => {
      // Kodi omite `items` cuando no hay nada: leerlo sin mas reventaria.
      rpc.query.and.returnValue(of({}));

      let items: unknown[] = [{ x: 1 }];
      repository.getPlaylist().subscribe(result => (items = result.items));

      expect(items).toEqual([]);
    });

    it('usa la cola de audio por defecto', () => {
      repository.getPlaylist().subscribe();

      expect(rpc.query.calls.mostRecent().args[1]).toEqual(
        jasmine.objectContaining({ playlistid: 0 })
      );
    });
  });

  describe('órdenes', () => {
    it('quita por posición, no por identificador', () => {
      // La cola se manipula por posicion: dos veces la misma pista son dos
      // entradas distintas.
      repository.removeItem(3).subscribe();

      expect(commandArgs()).toEqual({ playlistid: 0, position: 3 });
    });

    it('intercambia dos posiciones', () => {
      repository.swapItems(1, 4).subscribe();

      expect(commandArgs()).toEqual({ playlistid: 0, position1: 1, position2: 4 });
    });

    it('reproduce una posición de la cola', () => {
      repository.playItem(2).subscribe();

      expect(rpc.command.calls.mostRecent().args[0]).toBe(Methods.PlayerOpen);
      expect(commandArgs()).toEqual({
        item: { playlistid: 0, position: 2 }
      });
    });

    it('vacía la cola indicada', () => {
      repository.clearPlaylist(1).subscribe();

      expect(rpc.command.calls.mostRecent().args[0]).toBe(Methods.PlaylistClear);
      expect(commandArgs()).toEqual({ playlistid: 1 });
    });

    it('propaga el fallo', () => {
      rpc.command.and.returnValue(throwError(() => new Error('Kodi dijo que no')));
      let caught: Error | undefined;

      repository.clearPlaylist().subscribe({ error: (err: Error) => (caught = err) });

      expect(caught?.message).toBe('Kodi dijo que no');
    });
  });
});
