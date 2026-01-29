import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrentTrack, PlayerState, PlayerWebSocketAdapter, SetVolumeUseCase } from '@domains/music/player';
import { GetPlaylistUseCase, PlaylistItem, PlaylistResult } from '@domains/music/playlist';
import { startWith, Subscription, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaybackFacade {
   private readonly wsAdapter = inject(PlayerWebSocketAdapter);
  private readonly setVolumeUseCase = inject(SetVolumeUseCase);
  private readonly getPlaylistUseCase = inject(GetPlaylistUseCase);
   getPlaylist = computed(() => {
    return this.playlist().items;
  });

  stateSubscription: Subscription | null = null;
    trackSubscription: Subscription | null = null;
    playlistSubscription: Subscription | null = null;
  private playlist$ = this.wsAdapter.getPlaylistChangedStream()
  .pipe(
    startWith(void 0),
    switchMap(() => this.getPlaylistUseCase.execute())
  );

      playerState = toSignal(this.wsAdapter.getStateStream(), { initialValue: null });
    public playlist = toSignal(this.playlist$, { initialValue: { items: [] , total: 0 } as PlaylistResult });
        playerInfo = toSignal(this.wsAdapter.getCurrentTrackStream(), { initialValue: null });
      
    volume = computed(() => {
    const state = this.playerState();
    return state ? state.volume : 0;
  });

  isMute = computed(() => {
    const state = this.playerState();
    return state ? state.muted : false;
  });

  connect(): void {
    this.wsAdapter.connect();
  }

  disconnect(): void {
    this.wsAdapter.disconnect();
  }

  subscribe():void 
  {
  //   this.stateSubscription = this.wsAdapter.getStateStream().subscribe((state) => {
     // this.playerState = state;
   //   this.volume = state.volume;
    //  this.isMute = state.muted;
   // });

   // this.trackSubscription = this.wsAdapter.getCurrentTrackStream().subscribe((track) => {
   ///   this.playerInfo = track;
   /// });

    
  }

  unsubscribe(): void {
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

  updateVolume(event: number): void {
   // this.volume = event;
    this.setVolumeUseCase.execute(event).subscribe();
  }

}
