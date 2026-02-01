import {
  Component,
  ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';
import {
  IonContent,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonThumbnail
} from '@ionic/angular/standalone';

import { Actor } from '../../../domain/entities/actor.entity';
import { Movie } from '@domains/video/movie/domain/entities/movie.entity';
import { AssetsPipe } from '@shared/pipes/assets.pipe';

@Component({
  selector: 'app-actor-detail',
  standalone: true,
  imports: [
    IonContent,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonThumbnail,
    AssetsPipe
  ],
  templateUrl: './actor-detail.component.html',
  styleUrl: './actor-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActorDetailComponent {
  readonly actor = input.required<Actor>();
  readonly movies = input<Movie[]>([]);

  readonly movieSelected = output<Movie>();
  readonly playMovie = output<number>();

  onMovieClick(movie: Movie): void {
    this.movieSelected.emit(movie);
  }

  onPlayClick(movieId: number): void {
    this.playMovie.emit(movieId);
  }

  getRoleInMovie(movie: Movie): string {
    const role = this.actor().roles.find(r => r.movieId === movie.movieId);
    return role?.role || '';
  }
}
