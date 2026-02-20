// ==========================================================================
// PRESENTATION - Settings Page Component
// ==========================================================================

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonRadioGroup,
  IonRadio,
  IonInput,
} from '@ionic/angular/standalone';
import { ThemeService, ThemePreference } from '@shared/services/theme.service';
import { KodiConfigService } from '@shared/services/kodi-config.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonRadioGroup,
    IonRadio,
    IonInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  readonly themeService = inject(ThemeService);
  readonly config = inject(KodiConfigService);

  onThemeChange(event: CustomEvent): void {
    this.themeService.setTheme(event.detail.value as ThemePreference);
  }

  onWsPortChange(event: CustomEvent): void {
    const port = parseInt(event.detail.value as string, 10);
    if (!isNaN(port) && port > 0 && port <= 65535) {
      this.config.setWsPort(port);
    }
  }
}
