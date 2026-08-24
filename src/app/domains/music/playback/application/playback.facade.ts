import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrentTrack, PlayerState, PlayerWebSocketAdapter, SetVolumeUseCase, TogglePartyModeUseCase } from '@domains/music/player';
import { GetPlaylistUseCase, PlaylistItem, PlaylistResult } from '@domains/music/playlist';
import { startWith, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaybackFacade {
  private readonly wsAdapter = inject(PlayerWebSocketAdapter);
  private readonly setVolumeUseCase = inject(SetVolumeUseCase);
  private readonly getPlaylistUseCase = inject(GetPlaylistUseCase);
  private readonly togglePartyModeUseCase = inject(TogglePartyModeUseCase);
  private playlist$ = this.wsAdapter.getPlaylistChangedStream()
  .pipe(
    startWith(void 0),
    switchMap(() => this.getPlaylistUseCase.execute())
  );

  readonly playerState = toSignal(this.wsAdapter.getStateStream(), {
    initialValue: null
  });
  readonly playlist = toSignal(this.playlist$, {
    initialValue: { items: [], total: 0 } as PlaylistResult
  });
  readonly playerInfo = toSignal(this.wsAdapter.getCurrentTrackStream(), {
    initialValue: null
  });

  readonly volume = computed(() => this.playerState()?.volume ?? 0);

  readonly isMute = computed(() => this.playerState()?.muted ?? false);

  /** Elementos de la cola, sin el total. */
  readonly getPlaylist = computed<PlaylistItem[]>(() => this.playlist().items);

  connect(): void {
    this.wsAdapter.connect();
  }

  disconnect(): void {
    this.wsAdapter.disconnect();
  }

  /**
   * Suelta la conexion al cerrar la aplicacion.
   *
   * Antes recorria tres campos de suscripcion que nadie asignaba: el codigo que
   * los llenaba estaba comentado, junto con un metodo subscribe() de cuerpo
   * vacio. Lo unico que hacia de verdad era desconectar.
   */
  unsubscribe(): void {
    this.wsAdapter.disconnect();
  }

  updateVolume(event: number): void {
    this.setVolumeUseCase.execute(event).subscribe();
  }

  togglePartyMode(): void {
    this.togglePartyModeUseCase.execute().subscribe();
  }
}
