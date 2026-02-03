import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, IonHeader, IonIcon, IonToolbar, IonMenu, IonButton, IonButtons, IonSearchbar, IonContent, IonMenuToggle } from '@ionic/angular/standalone';
import { CurrentPlayListComponent } from '@domains/music/playlist';
import { CurrentTrackComponent, PlayerControlComponent, SoundComponent } from '@domains/music/player';
import { PlaybackFacade } from '@domains/music/playback/application/playback.facade';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  imports: [
    CurrentPlayListComponent,
    IonRouterOutlet,
    CurrentTrackComponent,
    PlayerControlComponent,
    SoundComponent,
    IonHeader,
    IonIcon,
    IonToolbar,
    IonMenu,
    IonButton,
    IonButtons,
    IonSearchbar,
    IonContent,
    IonMenuToggle
  ]
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
