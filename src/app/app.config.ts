import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { TRACK_PROVIDERS } from '@domains/music/track';
import { ALBUM_PROVIDERS } from '@domains/music/album';
import { ARTIST_PROVIDERS } from '@domains/music/artist';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...ALBUM_PROVIDERS,
    ...TRACK_PROVIDERS,
    ...ARTIST_PROVIDERS
  ]
};
