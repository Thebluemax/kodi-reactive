import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import {
  IonContent,
  IonList,
  IonProgressBar
} from '@ionic/angular/standalone';

import { MediaTileComponent, LateralPanelComponent } from '@domains/music/shared';
import { VideoGenre } from '../../../domain/entities/video-genre.entity';
import { GetVideoGenresUseCase } from '../../../application/use-cases/get-video-genres.use-case';
import { VideoGenreDetailComponent } from '../video-genre-detail/video-genre-detail.component';

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

  // State
  readonly genres = signal<VideoGenre[]>([]);
  readonly selectedGenre = signal<VideoGenre | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);

  // Computed
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
        this.genres.set(result.genres);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading genres:', err);
        this.isLoading.set(false);
      }
    });
  }
}
