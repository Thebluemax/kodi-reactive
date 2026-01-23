import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { addIcons } from 'ionicons';
import {
  playOutline,
  duplicateOutline,
  eyeOutline,
  share,
  trash,
  add,
  play,
  closeOutline
} from 'ionicons/icons';

if (environment.production) {
  enableProdMode();
}

// Register all icons globally
addIcons({
  playOutline,
  duplicateOutline,
  eyeOutline,
  share,
  trash,
  add,
  play,
  closeOutline
});

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
