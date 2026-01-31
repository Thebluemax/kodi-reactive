import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-video-shell',
  templateUrl: './video-shell.component.html',
  styleUrls: ['./video-shell.component.scss'],
  imports: [IonicModule, RouterOutlet],
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
