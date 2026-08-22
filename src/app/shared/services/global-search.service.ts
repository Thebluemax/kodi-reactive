import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter, debounceTime, distinctUntilChanged, pairwise, startWith } from 'rxjs';

export type Section = 'music' | 'video' | 'remote' | null;

@Injectable({
  providedIn: 'root',
})
export class GlobalSearchService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _searchTerm = signal<string>('');
  private readonly _debouncedSearchTerm = signal<string>('');
  private readonly _activeSection = signal<Section>(null);
  private readonly _activeSubSection = signal<string | null>(null);

  readonly searchTerm = this._searchTerm.asReadonly();
  readonly debouncedSearchTerm = this._debouncedSearchTerm.asReadonly();
  readonly activeSection = this._activeSection.asReadonly();
  readonly activeSubSection = this._activeSubSection.asReadonly();

  readonly isSearchVisible = computed(() => {
    const section = this._activeSection();
    return section === 'music' || section === 'video';
  });

  constructor() {
    this.setupRouteListener();
    this.setupDebounce();
    this.parseCurrentRoute(this.router.url);
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  clearSearch(): void {
    this._searchTerm.set('');
    this._debouncedSearchTerm.set('');
  }

  private setupRouteListener(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith({ urlAfterRedirects: this.router.url } as NavigationEnd),
        pairwise(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(([prev, curr]) => {
        const previous = this.parseRoute(prev.urlAfterRedirects);
        const current = this.parseRoute(curr.urlAfterRedirects);

        this._activeSection.set(current.section);
        this._activeSubSection.set(current.subSection);

        // El termino se limpia tambien entre sub-secciones: cada lista filtra
        // por un campo distinto y sin vocabulario en comun, asi que arrastrarlo
        // solo produce pantallas vacias.
        if (
          previous.section !== current.section ||
          previous.subSection !== current.subSection
        ) {
          this.clearSearch();
        }
      });
  }

  private setupDebounce(): void {
    toObservable(this._searchTerm)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(term => {
        this._debouncedSearchTerm.set(term);
      });
  }

  private parseCurrentRoute(url: string): void {
    const { section, subSection } = this.parseRoute(url);
    this._activeSection.set(section);
    this._activeSubSection.set(subSection);
  }

  private parseRoute(url: string): { section: Section; subSection: string | null } {
    const path = this.stripUrlSuffix(url);
    return {
      section: this.extractSection(path),
      subSection: this.extractSubSection(path)
    };
  }

  /** Descarta query string y fragment para que no alteren la comparacion de rutas */
  private stripUrlSuffix(url: string): string {
    return url.split(/[?#]/)[0];
  }

  private extractSection(url: string): Section {
    if (url.startsWith('/music')) return 'music';
    if (url.startsWith('/video')) return 'video';
    if (url.startsWith('/remote')) return 'remote';
    return null;
  }

  private extractSubSection(url: string): string | null {
    const parts = url.split('/').filter(Boolean);
    return parts.length > 1 ? parts[1] : null;
  }
}
