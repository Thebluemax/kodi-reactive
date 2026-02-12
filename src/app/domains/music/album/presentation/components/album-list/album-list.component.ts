import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonProgressBar,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';

import { LateralPanelComponent } from '@shared/components/lateral-panel/lateral-panel.component';
import { MediaTileComponent } from '@shared/components/media-tile/media-tile.component';
import { Album, AlbumSearchParams } from '../../../domain/entities/album.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { GetAlbumsUseCase } from '../../../application/use-cases/get-albums.use-case';
import { GetAlbumDetailUseCase } from '../../../application/use-cases/get-album-detail.use-case';
import { AddAlbumToPlaylistUseCase } from '../../../application/use-cases/add-album-to-playlist.use-case';
import { AlbumDetailComponent } from '../album-detail/album-detail.component';
import { GlobalSearchService } from '@shared/services/global-search.service';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonProgressBar,
    MediaTileComponent,
    LateralPanelComponent,
    AlbumDetailComponent
  ],
  templateUrl: './album-list.component.html',
  styleUrl: './album-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumListComponent implements OnInit {
  // Use Cases
  private readonly getAlbumsUseCase = inject(GetAlbumsUseCase);
  private readonly getAlbumDetailUseCase = inject(GetAlbumDetailUseCase);
  private readonly addToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  readonly albums = signal<Album[]>([]);
  readonly selectedAlbum = signal<Album | null>(null);
  readonly tracks = signal<Track[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly totalAlbums = signal<number>(9999);

  // Pagination
  private readonly limit = 40;
  private start = 0;
  private end = this.limit;
  private currentSearchTerm = '';

  // Computed
  readonly hasMoreAlbums = computed(() => this.start < this.totalAlbums());

  constructor() {
    effect(() => {
      const term = this.globalSearch.debouncedSearchTerm();
      if (this.currentSearchTerm !== term) {
        this.currentSearchTerm = term;
        this.resetPagination();
        this.loadAlbums();
      }
    });
  }

  ngOnInit(): void {
    this.loadAlbums();
  }

  private resetPagination(): void {
    this.start = 0;
    this.end = this.limit;
    this.albums.set([]);
  }

  loadAlbums(): void {
    this.isLoading.set(true);

    const params: AlbumSearchParams = {
      start: this.start,
      end: this.end,
      searchTerm: this.currentSearchTerm || undefined
    };

    this.getAlbumsUseCase.execute(params).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        this.totalAlbums.set(result.total);
        this.albums.update(current => [...current, ...result.albums]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading albums:', err);
        this.isLoading.set(false);
      }
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreAlbums()) {
      event.target.disabled = true;
      return;
    }

    this.start = this.end + 1;
    this.end = this.end + this.limit;
    this.loadAlbums();

    setTimeout(() => event.target.complete(), 500);
  }

  onAlbumSelected(album: unknown): void {
    const selectedAlbum = album as Album;
    this.isLoading.set(true);

    this.getAlbumDetailUseCase.execute(selectedAlbum.albumId).subscribe({
      next: (result) => {
        this.selectedAlbum.set(result.album);
        this.tracks.set(result.tracks);
        this.isPanelOpen.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading album detail:', err);
        this.isLoading.set(false);
      }
    });
  }

  onAddToPlaylist(event: { media: unknown; playMedia: boolean }): void {
    const album = event.media as Album;
    this.addToPlaylistUseCase.execute(album.albumId, event.playMedia).subscribe({
      next: () => console.log('Album added to playlist'),
      error: (err) => console.error('Error adding to playlist:', err)
    });
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedAlbum.set(null);
  }

  onTrackAddToPlaylist(track: Track): void {
    // TODO: Implement track add to playlist use case
    console.log('Add track to playlist:', track);
  }
}
