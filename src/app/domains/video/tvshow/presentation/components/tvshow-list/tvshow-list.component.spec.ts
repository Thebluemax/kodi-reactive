import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Subject, of } from 'rxjs';

import { TVShowListComponent } from './tvshow-list.component';
import { GetTVShowsUseCase } from '../../../application/use-cases/get-tvshows.use-case';
import { RefreshTVShowUseCase } from '../../../application/use-cases/refresh-tvshow.use-case';
import { UpdateTVShowUseCase } from '../../../application/use-cases/update-tvshow.use-case';
import { GetTVShowDetailUseCase } from '../../../application/use-cases/get-tvshow-detail.use-case';
import { GetSeasonsUseCase } from '../../../application/use-cases/get-seasons.use-case';
import { GetEpisodesUseCase } from '../../../application/use-cases/get-episodes.use-case';
import { AddEpisodeToPlaylistUseCase } from '../../../application/use-cases/add-episode-to-playlist.use-case';
import { TVShowListResult } from '../../../domain/entities/tvshow.entity';

const PAGE_SIZE = 40;
const TOTAL = 500;


/**
 * Pagina realista: `start` elementos ya servidos y otros tantos nuevos. Los
 * mocks devolvian listas vacias con un total distinto de cero, que no puede
 * pasar, y por eso el guard del scroll pudo estar mal sin que nadie se enterara.
 */
function page(start: number, total: number) {
  const size = Math.max(0, Math.min(PAGE_SIZE, total - start));

  return {
    tvshows: Array.from({ length: size }, (_, i) => ({ tvshowId: start + i, title: `Serie ${start + i}`, genre: [], fanart: '', year: 2000 })),
    total,
    start,
    end: start + size
  };
}

describe('TVShowListComponent', () => {
  let fixture: ComponentFixture<TVShowListComponent>;
  let component: TVShowListComponent;
  let getTVShows: jasmine.SpyObj<GetTVShowsUseCase>;

  function lastParams(): { start: number; end: number } {
    return getTVShows.execute.calls.mostRecent().args[0] as { start: number; end: number };
  }

  function scrollEvent(): InfiniteScrollCustomEvent {
    return {
      target: { disabled: false, complete: (): void => undefined }
    } as unknown as InfiniteScrollCustomEvent;
  }

  beforeEach(async () => {
    getTVShows = jasmine.createSpyObj<GetTVShowsUseCase>('GetTVShowsUseCase', ['execute']);
    // Cada llamada sirve la pagina que se le pide, como haria Kodi.
    getTVShows.execute.and.callFake((params: { start: number }) =>
      of(page(params.start, TOTAL) as unknown as TVShowListResult)
    );

    await TestBed.configureTestingModule({
      imports: [TVShowListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GetTVShowsUseCase, useValue: getTVShows },
        {
          provide: GetTVShowDetailUseCase,
          useValue: jasmine.createSpyObj('GetTVShowDetailUseCase', ['execute'])
        },
        {
          provide: GetSeasonsUseCase,
          useValue: jasmine.createSpyObj('GetSeasonsUseCase', ['execute'])
        },
        {
          provide: GetEpisodesUseCase,
          useValue: jasmine.createSpyObj('GetEpisodesUseCase', ['execute'])
        },
        {
          provide: AddEpisodeToPlaylistUseCase,
          useValue: jasmine.createSpyObj('AddEpisodeToPlaylistUseCase', ['execute'])
        },
        { provide: Router, useValue: { events: new Subject(), url: '/video/tvshows' } },
        {
          provide: UpdateTVShowUseCase,
          useValue: jasmine.createSpyObj('UpdateTVShowUseCase', ['execute'])
        },
        {
          provide: RefreshTVShowUseCase,
          useValue: jasmine.createSpyObj('RefreshTVShowUseCase', ['execute'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TVShowListComponent);
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
  // Regresion: el scroll pedia una pagina de mas y duplicaba la lista
  // ========================================================================

  describe('final de la lista', () => {
    const EXACT = PAGE_SIZE * 2;

    beforeEach(() => {
      getTVShows.execute.and.callFake((params: { start: number }) =>
        of(page(params.start, EXACT) as unknown as TVShowListResult)
      );
      component.onInfiniteScroll(scrollEvent());
    });

    it('no pide ninguna pagina de mas con un total multiplo del tamaño de pagina', () => {
      // El guard comparaba `start`, que apunta a la pagina ya pedida: con 80
      // elementos pedia start=80, fuera de rango, y Kodi respondia con la lista
      // entera.
      const calls = getTVShows.execute.calls.count();
      component.onInfiniteScroll(scrollEvent());

      expect(getTVShows.execute.calls.count()).toBe(calls);
    });

    it('corta al tener todo cargado', () => {
      expect(component.hasMoreTVShows()).toBeFalse();
    });

    it('no repite ningun elemento', () => {
      const ids = component.tvshows().map(item => item.tvshowId);

      expect(ids.length).toBe(EXACT);
      expect(new Set(ids).size).toBe(EXACT);
    });

  });
});
