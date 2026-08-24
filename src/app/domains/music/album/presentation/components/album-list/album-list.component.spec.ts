import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { Subject, of } from 'rxjs';

import { AlbumListComponent } from './album-list.component';
import { ALBUM_EDIT_SCHEMA } from '../../schemas/album-edit.schema';
import { GetAlbumsUseCase } from '../../../application/use-cases/get-albums.use-case';
import { GetAlbumDetailUseCase } from '../../../application/use-cases/get-album-detail.use-case';
import { UpdateAlbumUseCase } from '../../../application/use-cases/update-album.use-case';
import { AddAlbumToPlaylistUseCase } from '../../../application/use-cases/add-album-to-playlist.use-case';
import { AlbumListResult } from '../../../domain/entities/album.entity';

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
    albums: Array.from({ length: size }, (_, i) => ({ albumId: start + i, title: `Album ${start + i}`, artists: [], thumbnail: '', year: 2000 })),
    total,
    start,
    end: start + size
  };
}

describe('AlbumListComponent', () => {
  let fixture: ComponentFixture<AlbumListComponent>;
  let component: AlbumListComponent;
  let getAlbums: jasmine.SpyObj<GetAlbumsUseCase>;
  let updateAlbum: jasmine.SpyObj<UpdateAlbumUseCase>;
  let getAlbumDetail: jasmine.SpyObj<GetAlbumDetailUseCase>;

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
    // Cada llamada sirve la pagina que se le pide, como haria Kodi.
    getAlbums.execute.and.callFake((params: { start: number }) =>
      of(page(params.start, TOTAL) as unknown as AlbumListResult)
    );

    updateAlbum = jasmine.createSpyObj<UpdateAlbumUseCase>('UpdateAlbumUseCase', ['execute']);
    updateAlbum.execute.and.returnValue(of(void 0));

    getAlbumDetail = jasmine.createSpyObj<GetAlbumDetailUseCase>('GetAlbumDetailUseCase', ['execute']);

    await TestBed.configureTestingModule({
      imports: [AlbumListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GetAlbumsUseCase, useValue: getAlbums },
        { provide: GetAlbumDetailUseCase, useValue: getAlbumDetail },
        {
          provide: AddAlbumToPlaylistUseCase,
          useValue: jasmine.createSpyObj('AddAlbumToPlaylistUseCase', ['execute'])
        },
        { provide: UpdateAlbumUseCase, useValue: updateAlbum },
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

  it('deja de pedir paginas al llegar al total', () => {
    // El total llega igual en cada respuesta, asi que totalAlbums.set() no
    // notifica por igualdad. Si start no fuese un signal, hasMoreAlbums
    // quedaria congelado en el valor calculado con start = 0 y el scroll
    // seguiria pidiendo paginas para siempre.
    getAlbums.execute.and.returnValue(
      of({ albums: [], total: PAGE_SIZE * 2, start: 0, end: PAGE_SIZE })
    );
    fixture.detectChanges();

    component.onInfiniteScroll(scrollEvent());
    component.onInfiniteScroll(scrollEvent());

    expect(component.hasMoreAlbums()).toBeFalse();

    const callsBefore = getAlbums.execute.calls.count();
    const event = scrollEvent();
    component.onInfiniteScroll(event);

    expect(getAlbums.execute.calls.count()).toBe(callsBefore);
    expect(event.target.disabled).toBeTrue();
  });

  it('mantiene el encadenado en paginas sucesivas', () => {
    component.onInfiniteScroll(scrollEvent());
    component.onInfiniteScroll(scrollEvent());

    expect(lastParams()).toEqual(
      jasmine.objectContaining({ start: PAGE_SIZE * 2, end: PAGE_SIZE * 3 })
    );
  });

  // ========================================================================
  // Edicion: el panel se aparta, y al hacerlo se lleva por delante el album
  // seleccionado. El modal no puede depender de el.
  // ========================================================================

  describe('edicion', () => {
    const ALBUM = {
      albumId: 42,
      title: 'Kid A',
      label: 'Parlophone',
      artists: ['Radiohead'],
      artistIds: [1],
      genres: ['Electronic'],
      styles: [],
      year: 2000,
      thumbnail: '',
      fanart: '',
      dateAdded: '',
      playCount: 0,
      description: '',
      art: { thumb: 'image://cover/', fanart: '' },
      themes: [],
      moods: ['Melancholic'],
      type: 'album',
      rating: 8.5,
      userRating: 9,
      votes: 120,
      sortArtist: 'Radiohead',
      displayArtist: 'Radiohead',
      isBoxSet: false,
      releaseDate: '2000-10-02',
      originalDate: '',
      musicBrainzAlbumId: 'mb-album',
      musicBrainzReleaseGroupId: 'mb-group',
      musicBrainzAlbumArtistIds: ['mb-artist']
    };

    /** Lo que hace el panel al cerrarse: emitir panelClosed. */
    function panelEmitsClosed(): void {
      component.onPanelClosed();
    }

    beforeEach(() => {
      getAlbumDetail.execute.and.returnValue(of({ album: ALBUM, tracks: [], totalTracks: 0 }));
      component.selectedAlbum.set(ALBUM);
      component.isPanelOpen.set(true);
    });

    it('aparta el panel al pedir la edicion', () => {
      component.onEditRequested(ALBUM);

      expect(component.isPanelOpen()).toBeFalse();
      expect(component.albumBeingEdited()).toBe(ALBUM);
    });

    it('conserva el album del modal aunque el panel limpie el seleccionado', () => {
      component.onEditRequested(ALBUM);
      panelEmitsClosed();

      expect(component.selectedAlbum()).toBeNull();
      expect(component.albumBeingEdited()).toBe(ALBUM);
    });

    it('sigue mostrando los valores en el modal con el detalle ya limpio', () => {
      component.onEditRequested(ALBUM);
      panelEmitsClosed();

      expect(component.editValue()).toEqual(
        jasmine.objectContaining({ title: 'Kid A', year: 2000, label: 'Parlophone' })
      );
    });

    it('da valor a todas las claves que el esquema declara', () => {
      // Una clave declarada sin valor sale como caja vacia sobre un campo que
      // en Kodi si tiene contenido, y el usuario lo pisa sin querer.
      component.onEditRequested(ALBUM);
      const value = component.editValue();

      const sinValor = ALBUM_EDIT_SCHEMA
        .map(field => field.key)
        .filter(key => !(key in value));

      expect(sinValor).toEqual([]);
    });

    it('mantiene la referencia del valor mientras se edita', () => {
      // Si cambia entre lecturas, el input del modal la toma por un valor nuevo
      // y repone el borrador: lo tecleado se pierde y Guardar nunca se habilita.
      component.onEditRequested(ALBUM);

      expect(component.editValue()).toBe(component.editValue());
    });

    it('cambia la referencia al editar otro album', () => {
      component.onEditRequested(ALBUM);
      const first = component.editValue();

      component.onEditRequested({ ...ALBUM, albumId: 7, title: 'Amnesiac' });

      expect(component.editValue()).not.toBe(first);
    });

    it('guarda contra el album correcto con el detalle ya limpio', () => {
      component.onEditRequested(ALBUM);
      panelEmitsClosed();

      component.onEditSave({ title: 'Amnesiac' });

      expect(updateAlbum.execute).toHaveBeenCalledWith(42, { title: 'Amnesiac' });
    });

    it('repone el detalle tras guardar', () => {
      component.onEditRequested(ALBUM);
      panelEmitsClosed();
      component.onEditSave({ title: 'Amnesiac' });

      expect(component.isPanelOpen()).toBeTrue();
      expect(component.selectedAlbum()).toBe(ALBUM);
      expect(component.albumBeingEdited()).toBeNull();
    });

    it('repone el detalle al cancelar', () => {
      component.onEditRequested(ALBUM);
      panelEmitsClosed();

      component.onEditCancelled();

      expect(component.isPanelOpen()).toBeTrue();
      expect(component.selectedAlbum()).toBe(ALBUM);
    });

    it('recarga el album desde Kodi tras guardar', () => {
      component.onEditRequested(ALBUM);
      component.onEditSave({ title: 'Amnesiac' });

      expect(getAlbumDetail.execute).toHaveBeenCalledWith(42);
    });
  });

  // ========================================================================
  // Regresion: el scroll pedia una pagina de mas y duplicaba la lista
  // ========================================================================

  describe('final de la lista', () => {
    const EXACT = PAGE_SIZE * 2;

    beforeEach(() => {
      getAlbums.execute.and.callFake((params: { start: number }) =>
        of(page(params.start, EXACT) as unknown as AlbumListResult)
      );
      component.onInfiniteScroll(scrollEvent());
    });

    it('no pide ninguna pagina de mas con un total multiplo del tamaño de pagina', () => {
      // El guard comparaba `start`, que apunta a la pagina ya pedida: con 80
      // elementos pedia start=80, fuera de rango, y Kodi respondia con la lista
      // entera.
      const calls = getAlbums.execute.calls.count();
      component.onInfiniteScroll(scrollEvent());

      expect(getAlbums.execute.calls.count()).toBe(calls);
    });

    it('corta al tener todo cargado', () => {
      expect(component.hasMoreAlbums()).toBeFalse();
    });

    it('no repite ningun elemento', () => {
      const ids = component.albums().map(item => item.albumId);

      expect(ids.length).toBe(EXACT);
      expect(new Set(ids).size).toBe(EXACT);
    });

  });
});
