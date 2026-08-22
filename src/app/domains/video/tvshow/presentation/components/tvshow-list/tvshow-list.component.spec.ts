import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Subject, of } from 'rxjs';

import { TVShowListComponent } from './tvshow-list.component';
import { GetTVShowsUseCase } from '../../../application/use-cases/get-tvshows.use-case';
import { GetTVShowDetailUseCase } from '../../../application/use-cases/get-tvshow-detail.use-case';
import { GetSeasonsUseCase } from '../../../application/use-cases/get-seasons.use-case';
import { GetEpisodesUseCase } from '../../../application/use-cases/get-episodes.use-case';
import { AddEpisodeToPlaylistUseCase } from '../../../application/use-cases/add-episode-to-playlist.use-case';

const PAGE_SIZE = 40;

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
    getTVShows.execute.and.returnValue(
      of({ tvshows: [], total: 500, start: 0, end: PAGE_SIZE })
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
        { provide: Router, useValue: { events: new Subject(), url: '/video/tvshows' } }
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
});
