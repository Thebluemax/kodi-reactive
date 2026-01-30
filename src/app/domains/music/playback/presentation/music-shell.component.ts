import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-music-shell',
  templateUrl: './music-shell.component.html',
  styleUrls: ['./music-shell.component.scss'],
  imports: [IonicModule, RouterOutlet],
})
export class MusicShellComponent {
  private readonly router = inject(Router);

  segmentChanged(event: Event): void {
    const customEvent = event as CustomEvent;
    switch (customEvent.detail.value) {
      case 'albums':
        this.router.navigate(['/music/albums']);
        break;
      case 'artists':
        this.router.navigate(['/music/artists']);
        break;
      case 'genres':
        this.router.navigate(['/music/genres']);
        break;
    }
  }
}
