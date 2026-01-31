import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PlaybackFacade } from '@domains/music/playback/application/playback.facade';
import { IonicModule } from '@ionic/angular';
import { CurrentPlayListComponent, PlaylistItem } from '@domains/music/playlist';
import { Router, RouterOutlet } from '@angular/router';
import { CurrentTrackComponent, PlayerControlComponent, SoundComponent } from '@domains/music/player';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  imports: [
    IonicModule,
    CurrentPlayListComponent,
    RouterOutlet,
    CurrentTrackComponent,
    PlayerControlComponent,
    SoundComponent,
  ],
})
export class AppShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  playBackFacade = inject(PlaybackFacade);

  ngOnInit(): void {
    this.playBackFacade.connect();
    this.playBackFacade.subscribe();
  }

  ngOnDestroy(): void {
    this.playBackFacade.unsubscribe();
  }

  navigateTo(section: string): void {
    this.router.navigate([`/${section}`]);
  }

  updateVolume(event: number): void {
    this.playBackFacade.updateVolume(event);
  }

  onPlaylistChanged(): void {
    this.playBackFacade.getPlaylist();
  }
}
