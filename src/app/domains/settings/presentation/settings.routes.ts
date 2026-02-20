// ==========================================================================
// Settings Domain Routes
// ==========================================================================

import { Routes } from '@angular/router';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsPageComponent,
  },
];
