import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Subject, of } from 'rxjs';

import { AlbumListComponent } from './album-list.component';
import { GetAlbumsUseCase } from '../../../application/use-cases/get-albums.use-case';
import { GetAlbumDetailUseCase } from '../../../application/use-cases/get-album-detail.use-case';
import { AddAlbumToPlaylistUseCase } from '../../../application/use-cases/add-album-to-playlist.use-case';

const PAGE_SIZE = 40;

describe('AlbumListComponent', () => {
  let fixture: ComponentFixture<AlbumListComponent>;
  let component: AlbumListComponent;
  let getAlbums: jasmine.SpyObj<GetAlbumsUseCase>;

  function lastParams(): { start: number; end: number } {
    return getAlbums.execute.calls.mostRecent().args[0] as { start: number; end: number };
  }

  function scrollEvent(): InfiniteScrollCustomEvent {
    return {
      target: { disabled: false, complete: (): void => undefined }
    } as unknown as InfiniteScrollCustomEvent;
  }

  beforeEach(async () => {
    getAlbums = jasmine.createSpyObj<GetAlbumsUseCase>('GetAlbumsUseCase', ['execute']);
    getAlbums.execute.and.returnValue(
      of({ albums: [], total: 500, start: 0, end: PAGE_SIZE })
    );

    await TestBed.configureTestingModule({
      imports: [AlbumListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GetAlbumsUseCase, useValue: getAlbums },
        {
          provide: GetAlbumDetailUseCase,
          useValue: jasmine.createSpyObj('GetAlbumDetailUseCase', ['execute'])
        },
        {
          provide: AddAlbumToPlaylistUseCase,
          useValue: jasmine.createSpyObj('AddAlbumToPlaylistUseCase', ['execute'])
        },
        { provide: Router, useValue: { events: new Subject(), url: '/music/albums' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('pide la primera pagina desde el inicio', () => {
    expect(lastParams()).toEqual(jasmine.objectContaining({ start: 0, end: PAGE_SIZE }));
  });

  it('encadena las paginas sin saltear registros', () => {
    component.onInfiniteScroll(scrollEvent());

    // start debe retomar exactamente donde termino la pagina anterior:
    // end es exclusivo en List.Limits de Kodi, asi que start = end previo.
    expect(lastParams()).toEqual(
      jasmine.objectContaining({ start: PAGE_SIZE, end: PAGE_SIZE * 2 })
    );
  });

  it('mantiene el encadenado en paginas sucesivas', () => {
    component.onInfiniteScroll(scrollEvent());
    component.onInfiniteScroll(scrollEvent());

    expect(lastParams()).toEqual(
      jasmine.objectContaining({ start: PAGE_SIZE * 2, end: PAGE_SIZE * 3 })
    );
  });
});
