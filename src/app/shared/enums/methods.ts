export enum Methods {
  AudioLibraryGetSongs = 'AudioLibrary.GetSongs',
  AudioLibraryGetAlbums = 'AudioLibrary.GetAlbums',
  AudioLibraryGetGenres = 'AudioLibrary.GetGenres',
  AudioLibraryGetArtists = 'AudioLibrary.GetArtists',
  PlaylistOnAdd = 'Playlist.OnAdd',
  PlaylistOnRemove = 'Playlist.OnRemove',
  PlaylistOnClear = 'Playlist.OnClear',
  PlaylistGetItems = 'Playlist.GetItems',
  PlayerGetProperties = 'Player.GetProperties',
  PlayerGetItem = 'Player.GetItem',
  GUiOnDPMSDeactivated = 'GUI.OnDPMSDeactivated',
  GUIOnScreensaverDeactivated = 'GUI.OnScreensaverDeactivated',
  PlayerOnSpeedChanged = 'Player.OnSpeedChanged',
  PlayerOnStop = 'Player.OnStop',
  PlayerOnPlay = 'Player.OnPlay',
  PlayerOnAVStart = 'Player.OnAVStart',
  PlayerOnPropertyChanged = 'Player.OnPropertyChanged',
  ApplicationSetVolume = 'Application.SetVolume',
  ApplicationGetProperties = 'Application.GetProperties',

  // AudioLibrary - Maintenance
  AudioLibraryScan = 'AudioLibrary.Scan',
  AudioLibraryClean = 'AudioLibrary.Clean',

  // AudioLibrary - Notifications
  AudioLibraryOnScanStarted = 'AudioLibrary.OnScanStarted',
  AudioLibraryOnScanFinished = 'AudioLibrary.OnScanFinished',
  AudioLibraryOnCleanStarted = 'AudioLibrary.OnCleanStarted',
  AudioLibraryOnCleanFinished = 'AudioLibrary.OnCleanFinished',

  // VideoLibrary
  VideoLibraryGetMovies = 'VideoLibrary.GetMovies',
  VideoLibraryGetMovieDetails = 'VideoLibrary.GetMovieDetails',
  VideoLibraryGetTVShows = 'VideoLibrary.GetTVShows',
  VideoLibraryGetTVShowDetails = 'VideoLibrary.GetTVShowDetails',
  VideoLibraryGetSeasons = 'VideoLibrary.GetSeasons',
  VideoLibraryGetEpisodes = 'VideoLibrary.GetEpisodes',
  VideoLibraryGetGenres = 'VideoLibrary.GetGenres',

  // VideoLibrary - Maintenance
  VideoLibraryScan = 'VideoLibrary.Scan',
  VideoLibraryClean = 'VideoLibrary.Clean',

  // VideoLibrary - Notifications
  VideoLibraryOnScanStarted = 'VideoLibrary.OnScanStarted',
  VideoLibraryOnScanFinished = 'VideoLibrary.OnScanFinished',
  VideoLibraryOnCleanStarted = 'VideoLibrary.OnCleanStarted',
  VideoLibraryOnCleanFinished = 'VideoLibrary.OnCleanFinished',
}
