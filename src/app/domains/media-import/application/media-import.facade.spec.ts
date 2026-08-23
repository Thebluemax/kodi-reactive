import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { MediaImportFacade } from './media-import.facade';
import { MediaImportKodiRepository } from '../infrastructure/repositories/media-import-kodi.repository';
import { LibraryIndexItem, MediaKind } from '../domain/entities/media-import.entity';
import { UpdateMovieUseCase } from '@domains/video/movie/application/use-cases/update-movie.use-case';
import { UpdateTVShowUseCase } from '@domains/video/tvshow/application/use-cases/update-tvshow.use-case';
import { UpdateAlbumUseCase } from '@domains/music/album/application/use-cases/update-album.use-case';
import { UpdateArtistUseCase } from '@domains/music/artist/application/use-cases/update-artist.use-case';
import { UpdateTrackUseCase } from '@domains/music/track/application/use-cases/update-track.use-case';

const MOVIE: LibraryIndexItem = {
  id: 11,
  kind: MediaKind.Movie,
  key: 'smb://nas/cine/padrino.mkv',
  label: 'The Godfather',
  current: { title: 'The Godfather', year: 1972 }
};

const ALBUM: LibraryIndexItem = {
  id: 7,
  kind: MediaKind.Album,
  key: 'album:kid a',
  label: 'Kid A',
  current: { genres: ['Rock'] }
};

describe('MediaImportFacade', () => {
  let facade: MediaImportFacade;
  let repository: jasmine.SpyObj<MediaImportKodiRepository>;
  let updateMovie: jasmine.SpyObj<UpdateMovieUseCase>;
  let updateAlbum: jasmine.SpyObj<UpdateAlbumUseCase>;

  beforeEach(() => {
    repository = jasmine.createSpyObj<MediaImportKodiRepository>(
      'MediaImportKodiRepository',
      ['loadIndex']
    );
    repository.loadIndex.and.returnValue(of([MOVIE, ALBUM]));

    updateMovie = jasmine.createSpyObj<UpdateMovieUseCase>('UpdateMovieUseCase', ['execute']);
    updateMovie.execute.and.returnValue(of(void 0));

    updateAlbum = jasmine.createSpyObj<UpdateAlbumUseCase>('UpdateAlbumUseCase', ['execute']);
    updateAlbum.execute.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MediaImportKodiRepository, useValue: repository },
        { provide: UpdateMovieUseCase, useValue: updateMovie },
        { provide: UpdateAlbumUseCase, useValue: updateAlbum },
        {
          provide: UpdateTVShowUseCase,
          useValue: jasmine.createSpyObj('UpdateTVShowUseCase', ['execute'])
        },
        {
          provide: UpdateArtistUseCase,
          useValue: jasmine.createSpyObj('UpdateArtistUseCase', ['execute'])
        },
        {
          provide: UpdateTrackUseCase,
          useValue: jasmine.createSpyObj('UpdateTrackUseCase', ['execute'])
        }
      ]
    });

    facade = TestBed.inject(MediaImportFacade);
  });

  function previewJson(entries: unknown[]): void {
    facade.preview(JSON.stringify(entries)).subscribe();
  }

  it('previsualizar no escribe nada', () => {
    // Es la garantia central: sin esto, un archivo mal formado machaca la
    // biblioteca sin que nadie lo vea venir.
    previewJson([
      { kind: 'movie', file: 'smb://nas/cine/padrino.mkv', title: 'El Padrino' }
    ]);

    expect(facade.changedCount()).toBe(1);
    expect(updateMovie.execute).not.toHaveBeenCalled();
  });

  it('solo pide los tipos de medio que el archivo menciona', () => {
    previewJson([{ kind: 'movie', file: 'smb://nas/cine/padrino.mkv', year: 1900 }]);

    expect(repository.loadIndex).toHaveBeenCalledWith([MediaKind.Movie]);
  });

  it('reconoce el XML por el contenido, no por la extensión', () => {
    facade
      .preview('<movie><file>smb://nas/cine/padrino.mkv</file><year>1900</year></movie>')
      .subscribe();

    expect(facade.changedCount()).toBe(1);
  });

  it('no consulta la biblioteca si el archivo no da ninguna entrada', () => {
    facade.preview('{ roto').subscribe();

    expect(repository.loadIndex).not.toHaveBeenCalled();
    expect(facade.issues().length).toBe(1);
  });

  it('aplica solo los campos que cambian', () => {
    previewJson([
      {
        kind: 'movie',
        file: 'smb://nas/cine/padrino.mkv',
        title: 'El Padrino',
        year: 1972
      }
    ]);
    facade.apply().subscribe();

    // El año ya coincide: mandarlo seria reescribir por reescribir.
    expect(updateMovie.execute).toHaveBeenCalledWith(11, { title: 'El Padrino' });
  });

  it('encamina cada medio a su caso de uso', () => {
    previewJson([
      { kind: 'movie', file: 'smb://nas/cine/padrino.mkv', title: 'El Padrino' },
      { kind: 'album', title: 'Kid A', genres: ['Electronic'] }
    ]);
    facade.apply().subscribe();

    expect(updateMovie.execute).toHaveBeenCalledWith(11, { title: 'El Padrino' });
    expect(updateAlbum.execute).toHaveBeenCalledWith(7, { genres: ['Electronic'] });
  });

  it('no toca lo que ya coincide', () => {
    previewJson([
      { kind: 'movie', file: 'smb://nas/cine/padrino.mkv', title: 'The Godfather' }
    ]);
    facade.apply().subscribe();

    expect(facade.changedCount()).toBe(0);
    expect(updateMovie.execute).not.toHaveBeenCalled();
  });

  it('un fallo suelto no tumba el resto del lote', () => {
    updateMovie.execute.and.returnValue(throwError(() => new Error('Kodi dijo que no')));

    previewJson([
      { kind: 'movie', file: 'smb://nas/cine/padrino.mkv', title: 'El Padrino' },
      { kind: 'album', title: 'Kid A', genres: ['Electronic'] }
    ]);

    let results: unknown[] = [];
    facade.apply().subscribe(value => (results = value));

    expect(results.length).toBe(2);
    expect(facade.failedCount()).toBe(1);
    expect(updateAlbum.execute).toHaveBeenCalledWith(7, { genres: ['Electronic'] });
  });

  it('informa del error de cada elemento, no solo de que hubo fallos', () => {
    updateMovie.execute.and.returnValue(throwError(() => new Error('Kodi dijo que no')));

    previewJson([
      { kind: 'movie', file: 'smb://nas/cine/padrino.mkv', title: 'El Padrino' }
    ]);
    facade.apply().subscribe();

    expect(facade.results()[0].error).toContain('Kodi dijo que no');
  });

  it('comunica el fallo al leer la biblioteca en vez de dejar el plan vacío', () => {
    repository.loadIndex.and.returnValue(throwError(() => new Error('Kodi no responde')));

    previewJson([{ kind: 'movie', file: 'a.mkv', title: 'X' }]);

    expect(facade.plan()).toBeNull();
    expect(facade.issues()[0].message).toContain('Kodi no responde');
  });

  it('descartar deja el estado limpio', () => {
    previewJson([
      { kind: 'movie', file: 'smb://nas/cine/padrino.mkv', title: 'El Padrino' }
    ]);
    facade.reset();

    expect(facade.plan()).toBeNull();
    expect(facade.issues()).toEqual([]);
  });
});
