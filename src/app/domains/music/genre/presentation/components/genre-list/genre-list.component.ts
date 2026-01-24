// ==========================================================================
// PRESENTATION - Genre List Component
// ==========================================================================

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

import { Genre } from '../../../domain/entities/genre.entity';
import { GetGenresUseCase } from '../../../application/use-cases/get-genres.use-case';

@Component({
  selector: 'app-genre-list',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './genre-list.component.html',
  styleUrls: ['./genre-list.component.scss']
})
export class GenreListComponent implements OnInit, OnDestroy {
  private readonly getGenresUseCase = inject(GetGenresUseCase);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state
  readonly genres = signal<Genre[]>([]);
  readonly isLoading = signal<boolean>(false);

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
          this.genres.set(result.genres);
          this.isLoading.set(false);
        },
        error: error => {
          console.error('Error loading genres:', error);
          this.isLoading.set(false);
        }
      });
  }

  onGenreClick(genre: Genre): void {
    this.router.navigate(['/tabs/tab1/genres', genre.genreId], {
      state: { genre }
    });
  }
}
