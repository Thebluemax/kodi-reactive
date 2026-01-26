// ==========================================================================
// PRESENTATION - Artist List Component
// ==========================================================================

import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { IonicModule, InfiniteScrollCustomEvent } from '@ionic/angular';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { Artist, ArtistAlbumGroup } from '../../../domain/entities/artist.entity';
import { GetArtistsUseCase } from '../../../application/use-cases/get-artists.use-case';
import { GetArtistDetailUseCase } from '../../../application/use-cases/get-artist-detail.use-case';
import { TileHoverDirective } from '@shared/directives/tile-hover.directive';
import { LateralSlideComponent } from '@shared/services/lateral-slide.component';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArtistDetailComponent } from '../artist-detail/artist-detail.component';

const PAGE_SIZE = 40;

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [
    IonicModule,
    TileHoverDirective,
    LateralSlideComponent,
    ArtistDetailComponent,
    AssetsPipe
  ],
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss']
})
export class ArtistListComponent implements OnInit, OnDestroy {
  private readonly getArtistsUseCase = inject(GetArtistsUseCase);
  private readonly getArtistDetailUseCase = inject(GetArtistDetailUseCase);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  // Signals for reactive state
  readonly artists = signal<Artist[]>([]);
  readonly selectedArtist = signal<Artist | null>(null);
  readonly albums = signal<ArtistAlbumGroup[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly totalArtists = signal<number>(0);

  // Computed values
  readonly hasMoreArtists = computed(() =>
    this.artists().length < this.totalArtists()
  );

  private start = 0;
  private end = PAGE_SIZE;

  ngOnInit(): void {
    this.setupSearch();
    this.loadArtists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        this.searchTerm.set(term);
        this.resetPagination();
        this.loadArtists();
      });
  }

  private resetPagination(): void {
    this.start = 0;
    this.end = PAGE_SIZE;
    this.artists.set([]);
  }

  loadArtists(): void {
    this.isLoading.set(true);

    this.getArtistsUseCase
      .execute({
        start: this.start,
        end: this.end,
        searchTerm: this.searchTerm() || undefined
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.artists.update(current => [...current, ...result.artists]);
          this.totalArtists.set(result.total);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error loading artists:', error);
          this.isLoading.set(false);
        }
      });
  }

  onSearch(event: CustomEvent): void {
    const value = (event.detail.value as string) || '';
    this.searchSubject$.next(value);
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreArtists()) {
      event.target.complete();
      return;
    }

    this.start = this.end;
    this.end = this.start + PAGE_SIZE;

    this.getArtistsUseCase
      .execute({
        start: this.start,
        end: this.end,
        searchTerm: this.searchTerm() || undefined
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.artists.update(current => [...current, ...result.artists]);
          event.target.complete();
        },
        error: error => {
          console.error('Error loading more artists:', error);
          event.target.complete();
        }
      });
  }

  onArtistClick(artist: Artist): void {
    this.isLoading.set(true);

    this.getArtistDetailUseCase
      .execute(artist.artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.selectedArtist.set(result.artist);
          this.albums.set(result.albums);
          this.isLoading.set(false);
          this.isPanelOpen.set(true);
        },
        error: error => {
          console.error('Error loading artist details:', error);
          this.isLoading.set(false);
        }
      });
  }

  onClosePanel(): void {
    this.selectedArtist.set(null);
    this.albums.set([]);
    this.isPanelOpen.set(false);
  }
}
