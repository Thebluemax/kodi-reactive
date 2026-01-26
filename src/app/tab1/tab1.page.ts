import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CurrentPlayListComponent, PlaylistItem, GetPlaylistUseCase } from '@domains/music/playlist';
import { Subscription } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { SideBarService } from '../core/services/side-bar.service';
import { IonicModule } from '@ionic/angular';
import {
  PlayerControlComponent,
  CurrentTrackComponent,
  SoundComponent,
  PlayerWebSocketAdapter,
  PlayerState,
  CurrentTrack,
  SetVolumeUseCase
} from '@domains/music/player';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonicModule, CurrentPlayListComponent, RouterOutlet, CurrentTrackComponent, PlayerControlComponent, SoundComponent]
})
export class Tab1Page implements OnInit {
  private readonly wsAdapter = inject(PlayerWebSocketAdapter);
  private readonly setVolumeUseCase = inject(SetVolumeUseCase);
  private readonly getPlaylistUseCase = inject(GetPlaylistUseCase);
  private readonly ref = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly sidebarService = inject(SideBarService);

  volume = 0;
  isMute = false;
  title = 'Kodi Remote';
  playlist: PlaylistItem[] = [];
  pages: string[] = ['album', 'artist', 'genre'];
  playerState: PlayerState | null = null;
  playerInfo: CurrentTrack | null = null;
  showComponent = false;
  activeComponent = '';
  showLateral = false;
  stateSubscription: Subscription | null = null;
  trackSubscription: Subscription | null = null;
  playlistSubscription: Subscription | null = null;

  @ViewChild('playlistObject') playlistObject: CurrentPlayListComponent | null = null;

  ionViewDidEnter(): void {
    this.wsAdapter.connect();
    this.activeComponent = this.pages[0];
  }

  ionViewDidLeave(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.trackSubscription) {
      this.trackSubscription.unsubscribe();
    }
    if (this.playlistSubscription) {
      this.playlistSubscription.unsubscribe();
    }
    this.wsAdapter.disconnect();
  }

  ngOnInit(): void {
    this.subscribeToPlayerState();
    this.getPlaylists();
  }

  subscribeToPlayerState(): void {
    this.stateSubscription = this.wsAdapter.getStateStream().subscribe((state) => {
      this.playerState = state;
      this.volume = state.volume;
      this.isMute = state.muted;
      this.ref.markForCheck();
    });

    this.trackSubscription = this.wsAdapter.getCurrentTrackStream().subscribe((track) => {
      this.playerInfo = track;
      this.ref.markForCheck();
    });

    this.playlistSubscription = this.wsAdapter.getPlaylistChangedStream().subscribe(() => {
      this.getPlaylists();
    });
  }

  updateVolume(event: number): void {
    this.volume = event;
    this.setVolumeUseCase.execute(event).subscribe();
  }

  getPlaylists(): void {
    this.getPlaylistUseCase.execute().subscribe({
      next: (result) => {
        this.playlist = result.items;
        this.ref.markForCheck();
      },
      error: (err) => console.error('Failed to get playlist:', err)
    });
  }

  onPlaylistChanged(): void {
    this.getPlaylists();
  }

  change(): void {
    const position = this.pages.indexOf(this.activeComponent);
    if (position < this.pages.length - 1) {
      this.activeComponent = this.pages[position + 1];
    } else {
      this.activeComponent = this.pages[0];
    }
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

  toggleLateral(): void {
    this.showLateral = !this.showLateral;
  }
}
