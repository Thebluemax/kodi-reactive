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
import { forkJoin } from 'rxjs';

import { MediaTileComponent, LateralPanelComponent } from '@domains/music/shared';
import { TVShow, TVShowSearchParams, Season, Episode } from '../../../domain/entities/tvshow.entity';
import { GetTVShowsUseCase } from '../../../application/use-cases/get-tvshows.use-case';
import { GetTVShowDetailUseCase } from '../../../application/use-cases/get-tvshow-detail.use-case';
import { GetSeasonsUseCase } from '../../../application/use-cases/get-seasons.use-case';
import { GetEpisodesUseCase } from '../../../application/use-cases/get-episodes.use-case';
import { AddEpisodeToPlaylistUseCase } from '../../../application/use-cases/add-episode-to-playlist.use-case';
import { TVShowDetailComponent } from '../tvshow-detail/tvshow-detail.component';
import { GlobalSearchService } from '@shared/services/global-search.service';

@Component({
  selector: 'app-tvshow-list',
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonProgressBar,
    MediaTileComponent,
    LateralPanelComponent,
    TVShowDetailComponent
  ],
  templateUrl: './tvshow-list.component.html',
  styleUrl: './tvshow-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TVShowListComponent implements OnInit {
  // Use Cases
  private readonly getTVShowsUseCase = inject(GetTVShowsUseCase);
  private readonly getTVShowDetailUseCase = inject(GetTVShowDetailUseCase);
  private readonly getSeasonsUseCase = inject(GetSeasonsUseCase);
  private readonly getEpisodesUseCase = inject(GetEpisodesUseCase);
  private readonly addEpisodeToPlaylistUseCase = inject(AddEpisodeToPlaylistUseCase);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  readonly tvshows = signal<TVShow[]>([]);
  readonly selectedTVShow = signal<TVShow | null>(null);
  readonly seasons = signal<Season[]>([]);
  readonly episodes = signal<Episode[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly totalTVShows = signal<number>(9999);

  // Pagination
  private readonly limit = 40;
  private start = 0;
  private end = this.limit;
  private currentSearchTerm = '';

  // Computed
  readonly hasMoreTVShows = computed(() => this.start < this.totalTVShows());
  readonly panelTitle = computed(() => this.selectedTVShow()?.title ?? '');

  constructor() {
    effect(() => {
      const term = this.globalSearch.debouncedSearchTerm();
      if (this.currentSearchTerm !== term) {
        this.currentSearchTerm = term;
        this.resetPagination();
        this.loadTVShows();
      }
    });
  }

  ngOnInit(): void {
    this.loadTVShows();
  }

  private resetPagination(): void {
    this.start = 0;
    this.end = this.limit;
    this.tvshows.set([]);
  }

  loadTVShows(): void {
    this.isLoading.set(true);

    const params: TVShowSearchParams = {
      start: this.start,
      end: this.end,
      searchTerm: this.currentSearchTerm || undefined
    };

    this.getTVShowsUseCase.execute(params).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        this.totalTVShows.set(result.total);
        this.tvshows.update(current => [...current, ...result.tvshows]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading TV shows:', err);
        this.isLoading.set(false);
      }
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreTVShows()) {
      event.target.disabled = true;
      return;
    }

    this.start = this.end + 1;
    this.end = this.end + this.limit;
    this.loadTVShows();

    setTimeout(() => event.target.complete(), 500);
  }

  onTVShowSelected(tvshow: unknown): void {
    const selected = tvshow as TVShow;
    this.isLoading.set(true);

    forkJoin({
      detail: this.getTVShowDetailUseCase.execute(selected.tvshowId),
      seasons: this.getSeasonsUseCase.execute(selected.tvshowId)
    }).subscribe({
      next: ({ detail, seasons }) => {
        this.selectedTVShow.set(detail);
        this.seasons.set(seasons);
        this.isPanelOpen.set(true);

        // Load first season episodes
        if (seasons.length > 0) {
          this.loadEpisodes(selected.tvshowId, seasons[0].season);
        } else {
          this.episodes.set([]);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading TV show detail:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSeasonSelected(seasonNumber: number): void {
    const tvshow = this.selectedTVShow();
    if (!tvshow) return;

    this.isLoading.set(true);
    this.loadEpisodes(tvshow.tvshowId, seasonNumber);
  }

  onPlayEpisode(episodeId: number): void {
    this.addEpisodeToPlaylistUseCase.execute(episodeId, true).subscribe({
      error: (err) => console.error('Error playing episode:', err)
    });
  }

  onAddEpisodeToQueue(episodeId: number): void {
    this.addEpisodeToPlaylistUseCase.execute(episodeId, false).subscribe({
      error: (err) => console.error('Error adding episode to queue:', err)
    });
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedTVShow.set(null);
    this.seasons.set([]);
    this.episodes.set([]);
  }

  private loadEpisodes(tvshowId: number, season: number): void {
    this.getEpisodesUseCase.execute(tvshowId, season).subscribe({
      next: (episodes) => {
        this.episodes.set(episodes);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading episodes:', err);
        this.isLoading.set(false);
      }
    });
  }
}
