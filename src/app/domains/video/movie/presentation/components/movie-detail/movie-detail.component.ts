import {
  Component,
  ChangeDetectionStrategy,
  input,
  output
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

import { Movie } from '../../../domain/entities/movie.entity';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';

@Component({
  selector: 'app-movie-detail',
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
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetailComponent {
  // Inputs
  readonly movie = input.required<Movie>();

  // Outputs
  readonly playMovie = output<void>();
  readonly addToQueue = output<void>();
  readonly actorSelected = output<string>();

  onPlay(): void {
    this.playMovie.emit();
  }

  onAddToQueue(): void {
    this.addToQueue.emit();
  }

  onActorClick(actorName: string): void {
    this.actorSelected.emit(actorName);
  }

  formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
