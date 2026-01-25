// ==========================================================================
// Player Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  PlayerState,
  PlaybackTime,
  RepeatMode,
  PlayerStateFactory,
  KodiPlayerPropertiesResponse,
  KodiApplicationPropertiesResponse
} from './domain/entities/player-state.entity';

export {
  CurrentTrack,
  CurrentTrackFactory,
  KodiCurrentTrackResponse
} from './domain/entities/current-track.entity';

// Domain - Repository (interface)
export { PlayerRepository } from './domain/repositories/player.repository';

// Application - Use Cases
export { PlayPauseUseCase } from './application/use-cases/play-pause.use-case';
export { SeekUseCase } from './application/use-cases/seek.use-case';
export { NextTrackUseCase } from './application/use-cases/next-track.use-case';
export { PreviousTrackUseCase } from './application/use-cases/previous-track.use-case';
export { SetShuffleUseCase } from './application/use-cases/set-shuffle.use-case';
export { SetRepeatUseCase } from './application/use-cases/set-repeat.use-case';
export { TogglePartyModeUseCase } from './application/use-cases/toggle-party-mode.use-case';
export { SetVolumeUseCase } from './application/use-cases/set-volume.use-case';
export { ToggleMuteUseCase } from './application/use-cases/toggle-mute.use-case';

// Infrastructure - WebSocket Adapter
export { PlayerWebSocketAdapter } from './infrastructure/adapters/player-websocket.adapter';

// Presentation - Components
export { PlayerControlComponent } from './presentation/components/player-control/player-control.component';

// Infrastructure - Providers
export { PLAYER_PROVIDERS } from './player.providers';
