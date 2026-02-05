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
        this.parseCurrentRoute(curr.urlAfterRedirects);

        const prevSection = this.extractSection(prev.urlAfterRedirects);
        const currSection = this.extractSection(curr.urlAfterRedirects);

        if (prevSection !== currSection) {
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
    const section = this.extractSection(url);
    this._activeSection.set(section);

    const subSection = this.extractSubSection(url);
    this._activeSubSection.set(subSection);
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
