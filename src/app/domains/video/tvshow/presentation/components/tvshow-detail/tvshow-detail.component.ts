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
import { MediaPathComponent } from '@shared/components/media-path/media-path.component';
import { fileName } from '@shared/utils/media-path';
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
    IonButton,
    IonIcon,
    IonChip,
    AssetsPipe,
    ArrayToStringPipe,
    DecimalPipe,
    MediaPathComponent
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
  /**
   * El modal no se monta aqui: este componente se proyecta dentro del panel
   * lateral, que se saca a si mismo a document.body. Lo presenta el contenedor.
   */
  readonly editRequested = output<TVShow>();
  /** Volver a pedir los datos al scraper, indicandole con que titulo buscar. */
  readonly refreshRequested = output<TVShow>();
  /** Traer de Kodi lo que tenga ahora: el re-scrapeo es asincrono. */
  readonly reloadRequested = output<TVShow>();

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

  /** Solo el nombre: la ruta completa de un episodio no cabe en una fila. */
  episodeFileName(episode: Episode): string {
    return fileName(episode.file);
  }
}
