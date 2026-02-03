// ==========================================================================
// Remote Domain Routes
// ==========================================================================

import { Routes } from '@angular/router';
import { RemoteControlComponent } from './components/remote-control/remote-control.component';

export const REMOTE_ROUTES: Routes = [
  {
    path: '',
    component: RemoteControlComponent
  }
];
