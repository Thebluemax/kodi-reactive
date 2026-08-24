import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { VideoGenreKodiRepository } from './video-genre-kodi.repository';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

describe('VideoGenreKodiRepository', () => {
  let repository: VideoGenreKodiRepository;
  let rpc: jasmine.SpyObj<KodiRpcService>;

  beforeEach(() => {
    rpc = jasmine.createSpyObj<KodiRpcService>('KodiRpcService', ['query', 'command']);
    rpc.query.and.returnValue(of({ genres: [], limits: { total: 0 } }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiRpcService, useValue: rpc }
      ]
    });

    repository = TestBed.inject(VideoGenreKodiRepository);
  });

  it('devuelve los géneros de vídeo', () => {
    rpc.query.and.returnValue(
      of({ genres: [{ genreid: 1, label: 'Drama' }], limits: { total: 1 } })
    );

    let total = -1;
    repository.getGenres().subscribe(result => (total = result.total));

    expect(total).toBe(1);
  });

  it('acepta una biblioteca sin géneros', () => {
    let genres: unknown[] = [{ x: 1 }];
    repository.getGenres().subscribe(result => (genres = result.genres));

    expect(genres).toEqual([]);
  });

  it('filtra las películas por el género pedido', () => {
    rpc.query.and.returnValue(of({ movies: [], limits: { total: 0, start: 0, end: 0 } }));

    repository.getMoviesByGenre('Drama', { start: 0, end: 40 }).subscribe();

    expect(JSON.stringify(rpc.query.calls.mostRecent().args[1])).toContain('Drama');
  });

  it('propaga el fallo en vez de devolver una lista vacía', () => {
    rpc.query.and.returnValue(throwError(() => new Error('Kodi no responde')));
    let caught: Error | undefined;

    repository.getGenres().subscribe({ error: (err: Error) => (caught = err) });

    expect(caught?.message).toBe('Kodi no responde');
  });
});
