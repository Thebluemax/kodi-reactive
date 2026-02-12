import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'kodi-theme-preference';
const CYCLE: ThemePreference[] = ['system', 'light', 'dark'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  readonly preference = signal<ThemePreference>(this.loadPreference());

  readonly isDark = computed(() => {
    const pref = this.preference();
    if (pref === 'system') return this.systemIsDark();
    return pref === 'dark';
  });

  readonly themeIcon = computed(() => {
    const pref = this.preference();
    switch (pref) {
      case 'light': return 'sunny-outline';
      case 'dark': return 'moon-outline';
      default: return 'desktop-outline';
    }
  });

  private readonly systemIsDark = signal(this.darkQuery.matches);

  constructor() {
    this.darkQuery.addEventListener('change', (e) => {
      this.systemIsDark.set(e.matches);
    });

    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('ion-palette-dark', dark);
    });
  }

  toggleTheme(): void {
    const current = this.preference();
    const idx = CYCLE.indexOf(current);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    this.preference.set(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private loadPreference(): ThemePreference {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    if (stored && CYCLE.includes(stored)) return stored;
    return 'system';
  }
}
