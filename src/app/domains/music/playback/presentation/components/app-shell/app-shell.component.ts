import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PlaybackFacade } from '@domains/music/playback/application/playback.facade';
import { IonicModule } from '@ionic/angular';
import { CurrentPlayListComponent, PlaylistItem } from "@domains/music/playlist";
import { Router, RouterOutlet } from "@angular/router";
import { CurrentTrackComponent, PlayerControlComponent, SoundComponent } from "@domains/music/player";

@Component({
  selector: 'app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  imports: [
    IonicModule,
    CurrentPlayListComponent,
    RouterOutlet,
    CurrentTrackComponent,
    PlayerControlComponent,
    SoundComponent
]
})
export class AppShellComponent  implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.playBackFacade.unsubscribe();
  }
  private readonly router = inject(Router);

  playBackFacade = inject(PlaybackFacade);
  playerInfo = signal<any>(null);
  volume = signal<number>(0);
  public readonly isMute = signal<boolean>(false);
  playlist = signal<PlaylistItem[]>([]);
  playerState = signal<any>(null);

  ngOnInit(): void {
    this.playBackFacade.connect();
    this.playBackFacade.subscribe();
  }

  segmentChanged(event: Event): void {
    const customEvent = event as CustomEvent;
    switch (customEvent.detail.value) {
      case 'albums':
        this.router.navigate(['/collections/albums']);
        break;
      case 'artists':
        this.router.navigate(['/collections/artists']);
        break;
      case 'genres':
        this.router.navigate(['/collections/genres']);
        break;
    }
  }

  updateVolume(event: number) {
    this.playBackFacade.updateVolume(event);
  }

  onPlaylistChanged() {
    this.playBackFacade.getPlaylist();
  }
}
