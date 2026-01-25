import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { PlayerService } from '../core/services/player.service';
import { Methods } from '../core/enums/methods';
import { CurrentPlayListComponent } from '../components/current-play-list/current-play-list.component';
import { Subscription } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { SideBarService } from '../core/services/side-bar.service';
import { IonicModule } from '@ionic/angular';
import { CurrentTrackComponent } from '../components/current-track/current-track.component';
import { SoundComponent } from '../components/sound/sound.component';
import {
  PlayerControlComponent,
  PlayerWebSocketAdapter,
  PlayerState,
  CurrentTrack,
  SetVolumeUseCase
} from '@domains/music/player';
import { PlaylistItem, GetPlaylistUseCase } from '@domains/music/playlist';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss'],
    imports: [IonicModule, CurrentPlayListComponent, RouterOutlet, CurrentTrackComponent, PlayerControlComponent, SoundComponent]
})
export class Tab1Page implements OnInit {
  private plService = inject(PlayerService);
  private wsAdapter = inject(PlayerWebSocketAdapter);
  private setVolumeUseCase = inject(SetVolumeUseCase);
  private getPlaylistUseCase = inject(GetPlaylistUseCase);
  private ref = inject(ChangeDetectorRef);
  private router = inject(Router);
  private sidebarService = inject(SideBarService);

  volume: number = 0;
  isMute: boolean = false;
  title: string = 'Volume Control';
  playlist: PlaylistItem[] = [];
  pages: string[] = ['album', 'artist', 'genre'];
  playerState: PlayerState | null = null;
  playerInfo: CurrentTrack | null = null;
  showComponent: boolean = false;
  activeComponent: string = '';
  showLateral: boolean = false;
  statusSubcription: Subscription | null = null;
  stateSubscription: Subscription | null = null;
  trackSubscription: Subscription | null = null;
  playlistSubscription: Subscription | null = null;
  @ViewChild('playlistObject') playlistObject: CurrentPlayListComponent | null =
    null;
  ionViewDidEnter(): void {
    this.wsAdapter.connect();
    this.activeComponent = this.pages[0];
  }

  ionViewDidLeave(): void {
    if (this.statusSubcription) {
      this.statusSubcription.unsubscribe();
    }
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
    this.statusSubcription = this.getPlayerStatus();
    this.subscribeToPlayerState();
    this.getPlaylists();
  }

  getPlayerStatus() {
    return this.plService.getPlayerStatus().subscribe((data) => {
      const _data = data as any[];
      this.volume = _data[0].result.volume;
      this.isMute = _data[0].result.muted;
      this.title = `${_data[0].result.name} ${_data[0].result.version.major}.${_data[0].result.version.minor}.${_data[0].result.version.minor}`;
    });
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

    this.playlistSubscription = this.wsAdapter.getPlaylistChangedStream().subscribe((event) => {
      this.getPlaylists();
    });
  }

  updateVolume(event: number) {
    this.volume = event;
    this.setVolumeUseCase.execute(event).subscribe();
  }

  getMainInfo() {
    // State is now managed by PlayerWebSocketAdapter
    // This method is kept for backwards compatibility
  }

  getPlaylists() {
    this.getPlaylistUseCase.execute().subscribe({
      next: (result) => {
        this.playlist = result.items;
        this.ref.markForCheck();
      },
      error: (err) => console.error('Failed to get playlist:', err)
    });
  }

  onPlaylistChanged() {
    this.getPlaylists();
  }

  proceesMethod(data: any) {
    switch (data.method) {
      case Methods.PlaylistOnAdd:
        this.getPlaylists();
        break;

      default:
        break;
    }
  }

  processById(data: any) {
    switch (data.id) {
    }
  }

  change() {
    let position = this.pages.indexOf(this.activeComponent);
    if (position < this.pages.length - 1) {
      this.activeComponent = this.pages[position + 1];
    } else {
      this.activeComponent = this.pages[0];
    }
  }

  toPlayList(event: any) {
    // TODO: Use AddTrackToPlaylistUseCase or AddAlbumToPlaylistUseCase
    console.log('toPlayList event:', event);
  }

  segmentChanged(event: any) {
    console.log('segmentChanged', event);
    switch (event.detail.value) {
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
    //this.activeComponent = event.detail.value;
  }
  toggleLateral() {
    this.showLateral = !this.showLateral;
  }
}
