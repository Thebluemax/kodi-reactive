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
} from '@ionic/angular/standalone';
import { ThemeService, ThemePreference } from '@shared/services/theme.service';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  readonly themeService = inject(ThemeService);

  onThemeChange(event: CustomEvent): void {
    this.themeService.setTheme(event.detail.value as ThemePreference);
  }
}
