import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { GlobalSearchService } from './global-search.service';

class RouterStub {
  readonly events = new Subject<NavigationEnd>();
  private navigationId = 1;

  constructor(public url: string) {}

  navigateTo(url: string): void {
    this.url = url;
    this.events.next(new NavigationEnd(this.navigationId++, url, url));
  }
}

describe('GlobalSearchService', () => {
  let router: RouterStub;
  let service: GlobalSearchService;

  function createService(initialUrl: string): void {
    router = new RouterStub(initialUrl);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router }
      ]
    });
    service = TestBed.inject(GlobalSearchService);
  }

  it('limpia el termino al cambiar de sub-seccion dentro de la misma seccion', () => {
    createService('/music/albums');
    service.setSearchTerm('nevermind');

    router.navigateTo('/music/artists');

    expect(service.searchTerm()).toBe('');
  });

  it('limpia el termino al cambiar de seccion', () => {
    createService('/music/albums');
    service.setSearchTerm('nevermind');

    router.navigateTo('/video/movies');

    expect(service.searchTerm()).toBe('');
  });

  it('mantiene el termino al entrar al detalle de un genero', () => {
    createService('/music/genres');
    service.setSearchTerm('rock');

    router.navigateTo('/music/genres/5');

    expect(service.searchTerm()).toBe('rock');
  });

  it('ignora query string y fragment al comparar rutas', () => {
    createService('/music/albums');
    service.setSearchTerm('nevermind');

    router.navigateTo('/music/albums?page=2');

    expect(service.searchTerm()).toBe('nevermind');

    router.navigateTo('/music/albums#top');

    expect(service.searchTerm()).toBe('nevermind');
  });

  it('expone seccion y sub-seccion activas ya normalizadas', () => {
    createService('/music/albums');

    router.navigateTo('/video/tvshows?page=2');

    expect(service.activeSection()).toBe('video');
    expect(service.activeSubSection()).toBe('tvshows');
  });

  it('solo muestra el buscador en music y video', () => {
    createService('/music/albums');

    expect(service.isSearchVisible()).toBeTrue();

    router.navigateTo('/video/movies');

    expect(service.isSearchVisible()).toBeTrue();

    router.navigateTo('/remote');

    expect(service.isSearchVisible()).toBeFalse();

    router.navigateTo('/settings');

    expect(service.isSearchVisible()).toBeFalse();
  });
});
