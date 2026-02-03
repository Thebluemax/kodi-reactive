import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonContent,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonChip
} from '@ionic/angular/standalone';

import { TVShow, Season, Episode } from '../../../domain/entities/tvshow.entity';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';

@Component({
  selector: 'app-tvshow-detail',
  standalone: true,
  imports: [
    IonContent,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonIcon,
    IonChip,
    AssetsPipe,
    ArrayToStringPipe,
    DecimalPipe
  ],
  templateUrl: './tvshow-detail.component.html',
  styleUrl: './tvshow-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TVShowDetailComponent {
  // Inputs
  readonly tvshow = input.required<TVShow>();
  readonly seasons = input.required<Season[]>();
  readonly episodes = input.required<Episode[]>();

  // Outputs
  readonly seasonSelected = output<number>();
  readonly playEpisode = output<number>();
  readonly addEpisodeToQueue = output<number>();

  // Local state
  readonly selectedSeasonNumber = signal<number>(1);

  onSeasonClick(season: Season): void {
    this.selectedSeasonNumber.set(season.season);
    this.seasonSelected.emit(season.season);
  }

  onPlayEpisode(episodeId: number): void {
    this.playEpisode.emit(episodeId);
  }

  onAddToQueue(episodeId: number): void {
    this.addEpisodeToQueue.emit(episodeId);
  }

  formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
