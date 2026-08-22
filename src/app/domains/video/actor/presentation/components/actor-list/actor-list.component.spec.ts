import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Subject, of } from 'rxjs';

import { ActorListComponent } from './actor-list.component';
import { Actor } from '../../../domain/entities/actor.entity';
import { GetActorsUseCase } from '../../../application/use-cases/get-actors.use-case';
import { GetMoviesByActorUseCase } from '../../../application/use-cases/get-movies-by-actor.use-case';
import { GetMovieDetailUseCase } from '@domains/video/movie/application/use-cases/get-movie-detail.use-case';
import { AddMovieToPlaylistUseCase } from '@domains/video/movie/application/use-cases/add-movie-to-playlist.use-case';

const PAGE_SIZE = 40;

function makeActors(count: number): Actor[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `Actor ${i}`,
    thumbnail: '',
    roles: []
  }));
}

describe('ActorListComponent', () => {
  let fixture: ComponentFixture<ActorListComponent>;
  let component: ActorListComponent;

  function scrollEvent(): InfiniteScrollCustomEvent {
    return {
      target: { disabled: false, complete: (): void => undefined }
    } as unknown as InfiniteScrollCustomEvent;
  }

  beforeEach(async () => {
    const getActors = jasmine.createSpyObj<GetActorsUseCase>('GetActorsUseCase', ['execute']);
    getActors.execute.and.returnValue(
      of({ actors: makeActors(PAGE_SIZE * 2 + 5), total: PAGE_SIZE * 2 + 5 })
    );

    await TestBed.configureTestingModule({
      imports: [ActorListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GetActorsUseCase, useValue: getActors },
        {
          provide: GetMoviesByActorUseCase,
          useValue: jasmine.createSpyObj('GetMoviesByActorUseCase', ['execute'])
        },
        {
          provide: GetMovieDetailUseCase,
          useValue: jasmine.createSpyObj('GetMovieDetailUseCase', ['execute'])
        },
        {
          provide: AddMovieToPlaylistUseCase,
          useValue: jasmine.createSpyObj('AddMovieToPlaylistUseCase', ['execute'])
        },
        { provide: Router, useValue: { events: new Subject(), url: '/video/actors' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra solo la primera pagina al cargar', () => {
    expect(component.actors().length).toBe(PAGE_SIZE);
  });

  it('amplia la pagina al scrollear sin mutar la lista completa', () => {
    // displayCount es un signal: el slice se recalcula solo, sin necesidad
    // de reemplazar allActors para forzar la invalidacion del computed.
    component.onInfiniteScroll(scrollEvent());

    expect(component.actors().length).toBe(PAGE_SIZE * 2);
  });

  it('deja de ampliar al agotar la lista', () => {
    component.onInfiniteScroll(scrollEvent());
    component.onInfiniteScroll(scrollEvent());

    expect(component.actors().length).toBe(PAGE_SIZE * 2 + 5);
    expect(component.hasMoreActors()).toBeFalse();
  });
});
