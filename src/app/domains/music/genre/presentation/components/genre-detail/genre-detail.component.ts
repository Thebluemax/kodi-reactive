// ==========================================================================
// PRESENTATION - Genre Detail Component
// ==========================================================================

import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

import { Genre } from '../../../domain/entities/genre.entity';
import { Album } from '@domains/music/album/domain/entities/album.entity';
import { Artist } from '@domains/music/artist/domain/entities/artist.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { GetGenreDetailUseCase } from '../../../application/use-cases/get-genre-detail.use-case';
import { GetAlbumDetailUseCase, AlbumDetailComponent } from '@domains/music/album';
import { GetArtistDetailUseCase, ArtistDetailComponent, ArtistAlbumGroup } from '@domains/music/artist';
import { LateralSlideComponent } from '@shared/components/lateral-slide/lateral-slide.component';

import { AssetsPipe } from '@shared/pipes/assets.pipe';

@Component({
  selector: 'app-genre-detail',
  standalone: true,
  imports: [
    IonicModule,
    LateralSlideComponent,
    AlbumDetailComponent,
    ArtistDetailComponent,

    AssetsPipe
  ],
  templateUrl: './genre-detail.component.html',
  styleUrls: ['./genre-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly getGenreDetailUseCase = inject(GetGenreDetailUseCase);
  private readonly getAlbumDetailUseCase = inject(GetAlbumDetailUseCase);
  private readonly getArtistDetailUseCase = inject(GetArtistDetailUseCase);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state
  readonly genre = signal<Genre | null>(null);
  readonly albums = signal<Album[]>([]);
  readonly artists = signal<Artist[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Panel state
  readonly isPanelOpen = signal<boolean>(false);
  readonly panelType = signal<'album' | 'artist' | null>(null);

  // Album detail state
  readonly selectedAlbum = signal<Album | null>(null);
  readonly albumTracks = signal<Track[]>([]);

  // Artist detail state
  readonly selectedArtist = signal<Artist | null>(null);
  readonly artistAlbums = signal<ArtistAlbumGroup[]>([]);

  ngOnInit(): void {
    // Try to get genre from router state first
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { genre: Genre } | undefined;

    if (state?.genre) {
      this.loadGenreDetail(state.genre);
    } else {
      // Fallback: get from history state
      const historyState = history.state as { genre: Genre } | undefined;
      if (historyState?.genre) {
        this.loadGenreDetail(historyState.genre);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadGenreDetail(genre: Genre): void {
    this.genre.set(genre);
    this.isLoading.set(true);

    this.getGenreDetailUseCase
      .execute(genre)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.albums.set(result.albums);
          this.artists.set(result.artists);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error loading genre detail:', error);
          this.isLoading.set(false);
        }
      });
  }

  onAlbumClick(album: Album): void {
    this.isLoading.set(true);

    this.getAlbumDetailUseCase
      .execute(album.albumId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.selectedAlbum.set(result.album);
          this.albumTracks.set(result.tracks);
          this.panelType.set('album');
          this.isPanelOpen.set(true);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error loading album detail:', error);
          this.isLoading.set(false);
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
          this.artistAlbums.set(result.albums);
          this.panelType.set('artist');
          this.isPanelOpen.set(true);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error loading artist detail:', error);
          this.isLoading.set(false);
        }
      });
  }

  onClosePanel(): void {
    this.isPanelOpen.set(false);
    this.panelType.set(null);
    this.selectedAlbum.set(null);
    this.selectedArtist.set(null);
    this.albumTracks.set([]);
    this.artistAlbums.set([]);
  }

  onBack(): void {
    this.router.navigate(['/collections/genres']);
  }
}
