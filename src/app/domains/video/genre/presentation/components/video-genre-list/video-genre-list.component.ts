import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import {
  IonContent,
  IonList,
  IonProgressBar
} from '@ionic/angular/standalone';

import { LateralPanelComponent } from '@shared/components/lateral-panel/lateral-panel.component';
import { MediaTileComponent } from '@shared/components/media-tile/media-tile.component';
import { VideoGenre } from '../../../domain/entities/video-genre.entity';
import { GetVideoGenresUseCase } from '../../../application/use-cases/get-video-genres.use-case';
import { VideoGenreDetailComponent } from '../video-genre-detail/video-genre-detail.component';
import { GlobalSearchService } from '@shared/services/global-search.service';

@Component({
  selector: 'app-video-genre-list',
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonProgressBar,
    MediaTileComponent,
    LateralPanelComponent,
    VideoGenreDetailComponent
  ],
  templateUrl: './video-genre-list.component.html',
  styleUrl: './video-genre-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoGenreListComponent implements OnInit {
  // Use Cases
  private readonly getVideoGenresUseCase = inject(GetVideoGenresUseCase);
  private readonly globalSearch = inject(GlobalSearchService);

  // State
  private readonly allGenres = signal<VideoGenre[]>([]);
  readonly selectedGenre = signal<VideoGenre | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);

  // Computed
  readonly genres = computed(() => {
    const term = this.globalSearch.debouncedSearchTerm().toLowerCase();
    if (!term) return this.allGenres();
    return this.allGenres().filter(genre =>
      genre.title.toLowerCase().includes(term)
    );
  });

  readonly panelTitle = computed(() => this.selectedGenre()?.title ?? '');

  ngOnInit(): void {
    this.loadGenres();
  }

  onGenreSelected(genre: unknown): void {
    const selected = genre as VideoGenre;
    this.selectedGenre.set(selected);
    this.isPanelOpen.set(true);
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedGenre.set(null);
  }

  private loadGenres(): void {
    this.isLoading.set(true);

    this.getVideoGenresUseCase.execute().subscribe({
      next: (result) => {
        this.allGenres.set(result.genres);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading genres:', err);
        this.isLoading.set(false);
      }
    });
  }
}
