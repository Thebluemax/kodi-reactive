import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonProgressBar,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';

import { MediaTileComponent, LateralPanelComponent } from '@domains/music/shared';
import { Album, AlbumSearchParams } from '../../../domain/entities/album.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { GetAlbumsUseCase } from '../../../application/use-cases/get-albums.use-case';
import { GetAlbumDetailUseCase } from '../../../application/use-cases/get-album-detail.use-case';
import { AddAlbumToPlaylistUseCase } from '../../../application/use-cases/add-album-to-playlist.use-case';
import { AlbumDetailComponent } from '../album-detail/album-detail.component';

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
  private searchTerm = '';

  // Computed
  readonly hasMoreAlbums = computed(() => this.start < this.totalAlbums());

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    const params: AlbumSearchParams = {
      start: this.start,
      end: this.end,
      searchTerm: this.searchTerm || undefined
    };

    this.getAlbumsUseCase.execute(params).subscribe({
      next: (result) => {
        this.totalAlbums.set(result.total);
        this.albums.update(current => [...current, ...result.albums]);
      },
      error: (err) => console.error('Error loading albums:', err)
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
