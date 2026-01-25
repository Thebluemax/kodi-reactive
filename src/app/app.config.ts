import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { TRACK_PROVIDERS } from '@domains/music/track';
import { ALBUM_PROVIDERS } from '@domains/music/album';
import { ARTIST_PROVIDERS } from '@domains/music/artist';
import { GENRE_PROVIDERS } from '@domains/music/genre';
import { PLAYER_PROVIDERS } from '@domains/music/player';
import { PLAYLIST_PROVIDERS } from '@domains/music/playlist';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...ALBUM_PROVIDERS,
    ...TRACK_PROVIDERS,
    ...ARTIST_PROVIDERS,
    ...GENRE_PROVIDERS,
    ...PLAYER_PROVIDERS,
    ...PLAYLIST_PROVIDERS
  ]
};
