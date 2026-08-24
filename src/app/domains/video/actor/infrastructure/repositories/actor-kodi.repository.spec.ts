import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ActorKodiRepository } from './actor-kodi.repository';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

const MOVIE_WITH_CAST = {
  movieid: 1,
  label: 'El Padrino',
  cast: [
    { name: 'Al Pacino', role: 'Michael', order: 1, thumbnail: '' },
    { name: 'Marlon Brando', role: 'Vito', order: 0, thumbnail: '' }
  ]
};

describe('ActorKodiRepository', () => {
  let repository: ActorKodiRepository;
  let rpc: jasmine.SpyObj<KodiRpcService>;

  beforeEach(() => {
    rpc = jasmine.createSpyObj<KodiRpcService>('KodiRpcService', ['query', 'command']);
    rpc.query.and.returnValue(of({ movies: [], limits: { total: 0 } }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiRpcService, useValue: rpc }
      ]
    });

    repository = TestBed.inject(ActorKodiRepository);
  });

  it('deriva los actores del reparto de las películas', () => {
    // Kodi no tiene entidad de actor: salen del campo `cast`, y por eso
    // tampoco se pueden editar.
    rpc.query.and.returnValue(of({ movies: [MOVIE_WITH_CAST], limits: { total: 1 } }));

    let total = -1;
    repository.getActors().subscribe(result => (total = result.total));

    expect(total).toBe(2);
  });

  it('pide el reparto entre las propiedades', () => {
    repository.getActors().subscribe();

    expect(rpc.query.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({ properties: jasmine.arrayContaining(['cast']) })
    );
  });

  it('devuelve lista vacía si no hay películas', () => {
    let actors: unknown[] = [{ x: 1 }];
    repository.getActors().subscribe(result => (actors = result.actors));

    expect(actors).toEqual([]);
  });

  it('filtra las películas de un actor por su nombre', () => {
    repository.getMoviesByActor('Al Pacino').subscribe();

    expect(JSON.stringify(rpc.query.calls.mostRecent().args[1])).toContain('Al Pacino');
  });

  it('propaga el fallo en vez de devolver una lista vacía', () => {
    rpc.query.and.returnValue(throwError(() => new Error('Kodi no responde')));
    let caught: Error | undefined;

    repository.getActors().subscribe({ error: (err: Error) => (caught = err) });

    expect(caught?.message).toBe('Kodi no responde');
  });
});
