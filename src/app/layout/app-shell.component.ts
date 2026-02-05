import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, IonHeader, IonIcon, IonToolbar, IonMenu, IonButton, IonButtons, IonSearchbar, IonContent, IonMenuToggle } from '@ionic/angular/standalone';
import { CurrentPlayListComponent } from '@domains/music/playlist';
import { CurrentTrackComponent, PlayerControlComponent, SoundComponent } from '@domains/music/player';
import { PlaybackFacade } from '@domains/music/playback/application/playback.facade';
import { GlobalSearchService } from '@shared/services/global-search.service';

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
  readonly playBackFacade = inject(PlaybackFacade);
  readonly globalSearch = inject(GlobalSearchService);

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

  onSearch(event: CustomEvent): void {
    const value = (event.detail.value as string) || '';
    this.globalSearch.setSearchTerm(value);
  }
}
