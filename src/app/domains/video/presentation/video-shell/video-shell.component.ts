import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonSegment, IonSegmentButton, IonLabel, IonContent, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-video-shell',
  templateUrl: './video-shell.component.html',
  styleUrls: ['./video-shell.component.scss'],
  imports: [IonSegment, IonSegmentButton, IonLabel, IonContent, IonRouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoShellComponent {
  private readonly router = inject(Router);

  segmentChanged(event: Event): void {
    const customEvent = event as CustomEvent;
    switch (customEvent.detail.value) {
      case 'movies':
        this.router.navigate(['/video/movies']);
        break;
      case 'tvshows':
        this.router.navigate(['/video/tvshows']);
        break;
      case 'actors':
        this.router.navigate(['/video/actors']);
        break;
      case 'genres':
        this.router.navigate(['/video/genres']);
        break;
    }
  }
}
