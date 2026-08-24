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

  // AudioLibrary - Escritura
  AudioLibrarySetAlbumDetails = 'AudioLibrary.SetAlbumDetails',
  AudioLibrarySetArtistDetails = 'AudioLibrary.SetArtistDetails',
  AudioLibrarySetSongDetails = 'AudioLibrary.SetSongDetails',

  // AudioLibrary - Maintenance
  AudioLibraryScan = 'AudioLibrary.Scan',
  AudioLibraryClean = 'AudioLibrary.Clean',

  // AudioLibrary - Notifications
  AudioLibraryOnScanStarted = 'AudioLibrary.OnScanStarted',
  AudioLibraryOnScanFinished = 'AudioLibrary.OnScanFinished',
  AudioLibraryOnCleanStarted = 'AudioLibrary.OnCleanStarted',
  AudioLibraryOnCleanFinished = 'AudioLibrary.OnCleanFinished',

  // Metodos que hasta ahora se escribian a mano en los repositorios
  AudioLibraryGetAlbumDetails = 'AudioLibrary.GetAlbumDetails',
  AudioLibraryGetArtistDetails = 'AudioLibrary.GetArtistDetails',
  PlayerGetActivePlayers = 'Player.GetActivePlayers',
  PlayerOpen = 'Player.Open',
  PlaylistAdd = 'Playlist.Add',
  PlaylistClear = 'Playlist.Clear',
  PlaylistGetProperties = 'Playlist.GetProperties',
  PlaylistRemove = 'Playlist.Remove',
  PlaylistSwap = 'Playlist.Swap',

  // Files
  FilesGetSources = 'Files.GetSources',
  FilesGetDirectory = 'Files.GetDirectory',
  FilesPrepareDownload = 'Files.PrepareDownload',

  // VideoLibrary
  VideoLibraryGetMovies = 'VideoLibrary.GetMovies',
  VideoLibraryGetMovieDetails = 'VideoLibrary.GetMovieDetails',
  VideoLibraryGetTVShows = 'VideoLibrary.GetTVShows',
  VideoLibraryGetTVShowDetails = 'VideoLibrary.GetTVShowDetails',
  VideoLibraryGetSeasons = 'VideoLibrary.GetSeasons',
  VideoLibraryGetEpisodes = 'VideoLibrary.GetEpisodes',
  VideoLibraryGetGenres = 'VideoLibrary.GetGenres',

  // VideoLibrary - Re-scrapeo
  VideoLibraryRefreshMovie = 'VideoLibrary.RefreshMovie',
  VideoLibraryRefreshTVShow = 'VideoLibrary.RefreshTVShow',
  VideoLibraryRefreshEpisode = 'VideoLibrary.RefreshEpisode',
  VideoLibraryRefreshMusicVideo = 'VideoLibrary.RefreshMusicVideo',

  // VideoLibrary - Escritura
  VideoLibrarySetMovieDetails = 'VideoLibrary.SetMovieDetails',
  VideoLibrarySetTVShowDetails = 'VideoLibrary.SetTVShowDetails',

  // VideoLibrary - Maintenance
  VideoLibraryScan = 'VideoLibrary.Scan',
  VideoLibraryClean = 'VideoLibrary.Clean',

  // VideoLibrary - Notifications
  VideoLibraryOnScanStarted = 'VideoLibrary.OnScanStarted',
  VideoLibraryOnScanFinished = 'VideoLibrary.OnScanFinished',
  VideoLibraryOnCleanStarted = 'VideoLibrary.OnCleanStarted',
  VideoLibraryOnCleanFinished = 'VideoLibrary.OnCleanFinished',
}
