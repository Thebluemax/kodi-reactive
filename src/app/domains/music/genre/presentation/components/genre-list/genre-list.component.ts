// ==========================================================================
// PRESENTATION - Genre List Component
// ==========================================================================

import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IonContent,
  IonProgressBar,
  IonChip,
  IonLabel
} from '@ionic/angular/standalone';

import { Genre } from '../../../domain/entities/genre.entity';
import { Album } from '@domains/music/album/domain/entities/album.entity';
import { Artist } from '@domains/music/artist/domain/entities/artist.entity';
import { GetGenresUseCase } from '../../../application/use-cases/get-genres.use-case';
import { GlobalSearchService } from '@shared/services/global-search.service';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [
    IonContent,
    IonProgressBar,
    IonChip,
    IonLabel,
  ],
  templateUrl: './genre-list.component.html',
  styleUrls: ['./genre-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreListComponent implements OnInit, OnDestroy {
  private readonly getGenresUseCase = inject(GetGenresUseCase);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  private readonly allGenres = signal<Genre[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly selectedGenre = signal<Genre | null>(null);
  readonly albums = signal<Album[]>([]);
  readonly artists = signal<Artist[]>([]);

  readonly genres = computed(() => {
    const term = this.globalSearch.debouncedSearchTerm().toLowerCase();
    if (!term) return this.allGenres();
    return this.allGenres().filter(genre =>
      genre.title.toLowerCase().includes(term)
    );
  });

  readonly panelTitle = computed(() => this.selectedGenre()?.label ?? '');

  ngOnInit(): void {
    this.loadGenres();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadGenres(): void {
    this.isLoading.set(true);

    this.getGenresUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.allGenres.set(result.genres);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error loading genres:', error);
          this.isLoading.set(false);
        }
      });
  }

  onGenreClick(genre: Genre): void {
    this.router.navigate(['/music/genres', genre.genreId], { state: { genre } });
  }
}
