// ==========================================================================
// DOMAIN ENTITY - Player State
// ==========================================================================

/**
 * Represents playback time with hours, minutes, seconds, and milliseconds
 */
export interface PlaybackTime {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

/**
 * Repeat mode options for the player
 */
export type RepeatMode = 'off' | 'one' | 'all';

/**
 * Complete player state from Kodi
 */
export interface PlayerState {
  isPlaying: boolean;
  position: number;
  playlistId: number;
  currentTime: PlaybackTime;
  totalTime: PlaybackTime;
  percentage: number;
  shuffled: boolean;
  repeat: RepeatMode;
  partyMode: boolean;
  volume: number;
  muted: boolean;
  canSeek: boolean;
  canShuffle: boolean;
  canRepeat: boolean;
}

/**
 * Raw Kodi response for Player.GetProperties
 */
export interface KodiPlayerPropertiesResponse {
  playlistid: number;
  speed: number;
  position: number;
  totaltime: PlaybackTime;
  time: PlaybackTime;
  percentage: number;
  shuffled: boolean;
  repeat: RepeatMode;
  canrepeat: boolean;
  canshuffle: boolean;
  canseek: boolean;
  partymode: boolean;
}

/**
 * Raw Kodi response for Application.GetProperties
 */
export interface KodiApplicationPropertiesResponse {
  volume: number;
  muted: boolean;
}

/**
 * Factory to create PlayerState from Kodi API responses
 */
export class PlayerStateFactory {
  static fromKodiResponse(
    playerProps: KodiPlayerPropertiesResponse,
    appProps?: KodiApplicationPropertiesResponse
  ): PlayerState {
    return {
      isPlaying: playerProps.speed > 0,
      position: playerProps.position,
      playlistId: playerProps.playlistid,
      currentTime: playerProps.time,
      totalTime: playerProps.totaltime,
      percentage: playerProps.percentage,
      shuffled: playerProps.shuffled,
      repeat: playerProps.repeat,
      partyMode: playerProps.partymode,
      volume: appProps?.volume ?? 100,
      muted: appProps?.muted ?? false,
      canSeek: playerProps.canseek,
      canShuffle: playerProps.canshuffle,
      canRepeat: playerProps.canrepeat
    };
  }

  static createEmpty(): PlayerState {
    return {
      isPlaying: false,
      position: 0,
      playlistId: 0,
      currentTime: { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
      totalTime: { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
      percentage: 0,
      shuffled: false,
      repeat: 'off',
      partyMode: false,
      volume: 100,
      muted: false,
      canSeek: false,
      canShuffle: false,
      canRepeat: false
    };
  }
}
