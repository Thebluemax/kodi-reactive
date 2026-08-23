import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Subject, of } from 'rxjs';

import { MovieListComponent } from './movie-list.component';
import { GetMoviesUseCase } from '../../../application/use-cases/get-movies.use-case';
import { UpdateMovieUseCase } from '../../../application/use-cases/update-movie.use-case';
import { MOVIE_EDIT_SCHEMA } from '../../schemas/movie-edit.schema';
import { GetMovieDetailUseCase } from '../../../application/use-cases/get-movie-detail.use-case';
import { AddMovieToPlaylistUseCase } from '../../../application/use-cases/add-movie-to-playlist.use-case';
import { GetMoviesByActorUseCase } from '@domains/video/actor/application/use-cases/get-movies-by-actor.use-case';

const PAGE_SIZE = 40;

describe('MovieListComponent', () => {
  let fixture: ComponentFixture<MovieListComponent>;
  let component: MovieListComponent;
  let getMovies: jasmine.SpyObj<GetMoviesUseCase>;

  function lastParams(): { start: number; end: number } {
    return getMovies.execute.calls.mostRecent().args[0] as { start: number; end: number };
  }

  function scrollEvent(): InfiniteScrollCustomEvent {
    return {
      target: { disabled: false, complete: (): void => undefined }
    } as unknown as InfiniteScrollCustomEvent;
  }

  beforeEach(async () => {
    getMovies = jasmine.createSpyObj<GetMoviesUseCase>('GetMoviesUseCase', ['execute']);
    getMovies.execute.and.returnValue(
      of({ movies: [], total: 500, start: 0, end: PAGE_SIZE })
    );

    await TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GetMoviesUseCase, useValue: getMovies },
        {
          provide: GetMovieDetailUseCase,
          useValue: jasmine.createSpyObj('GetMovieDetailUseCase', ['execute'])
        },
        {
          provide: AddMovieToPlaylistUseCase,
          useValue: jasmine.createSpyObj('AddMovieToPlaylistUseCase', ['execute'])
        },
        {
          provide: GetMoviesByActorUseCase,
          useValue: jasmine.createSpyObj('GetMoviesByActorUseCase', ['execute'])
        },
        { provide: Router, useValue: { events: new Subject(), url: '/video/movies' } },
        {
          provide: UpdateMovieUseCase,
          useValue: jasmine.createSpyObj('UpdateMovieUseCase', ['execute'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('pide la primera pagina desde el inicio', () => {
    expect(lastParams()).toEqual(jasmine.objectContaining({ start: 0, end: PAGE_SIZE }));
  });

  it('encadena las paginas sin saltear registros', () => {
    component.onInfiniteScroll(scrollEvent());

    expect(lastParams()).toEqual(
      jasmine.objectContaining({ start: PAGE_SIZE, end: PAGE_SIZE * 2 })
    );
  });

  // ========================================================================
  // Edicion
  // ========================================================================

  describe('edicion', () => {
    it('da valor a todas las claves que el esquema declara', () => {
      // Una clave declarada sin valor sale como caja vacia sobre un campo que
      // en Kodi si tiene contenido, y el usuario lo pisa sin querer.
      const movie = {
        movieId: 11,
        title: 'El Padrino',
        genre: ['Drama'],
        year: 1972,
        rating: 9.2,
        runtime: 10500,
        plot: '',
        director: [],
        cast: [],
        thumbnail: '',
        fanart: '',
        playCount: 0,
        dateAdded: '',
        file: '',
        tagline: '',
        studio: [],
        country: [],
        originalTitle: 'The Godfather',
        sortTitle: '',
        plotOutline: '',
        writer: [],
        tag: [],
        showlink: [],
        premiered: '1972-03-24',
        mpaa: '',
        imdbNumber: '',
        votes: '',
        top250: 1,
        userRating: 0,
        trailer: '',
        set: '',
        art: {}
      };

      component.onEditRequested(movie);
      const value = component.editValue();

      const sinValor = MOVIE_EDIT_SCHEMA
        .map(field => field.key)
        .filter(key => !(key in value));

      expect(sinValor).toEqual([]);
    });
  });
});
