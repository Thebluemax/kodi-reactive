import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { ION_ICONS } from './icons';

if (environment.production) {
  enableProdMode();
}

// Register all icons globally
addIcons({
  ...ION_ICONS
});

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
