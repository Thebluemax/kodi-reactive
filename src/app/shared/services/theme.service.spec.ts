import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ThemeService } from './theme.service';

const STORAGE_KEY = 'kodi-theme-preference';

describe('ThemeService', () => {
  function create(): ThemeService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    return TestBed.inject(ThemeService);
  }

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.classList.remove('ion-palette-dark');
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.classList.remove('ion-palette-dark');
  });

  it('parte del tema del sistema si no hay nada guardado', () => {
    expect(create().preference()).toBe('system');
  });

  it('recuerda la preferencia entre recargas', () => {
    create().setTheme('dark');

    expect(create().preference()).toBe('dark');
  });

  it('ignora un valor guardado que no reconoce', () => {
    // Si alguien manipula el almacenamiento, mejor caer al sistema que
    // quedarse en un estado imposible.
    localStorage.setItem(STORAGE_KEY, 'inventado');

    expect(create().preference()).toBe('system');
  });

  it('aplica la clase oscura del documento', () => {
    create().setTheme('dark');
    // La clase la pone un effect: sin vaciar la cola aun no ha corrido.
    TestBed.tick();

    expect(document.documentElement.classList.contains('ion-palette-dark')).toBeTrue();
  });

  it('la quita al pasar a claro', () => {
    const service = create();
    service.setTheme('dark');

    service.setTheme('light');
    TestBed.tick();

    expect(document.documentElement.classList.contains('ion-palette-dark')).toBeFalse();
  });

  it('el ciclo recorre los tres estados y vuelve al principio', () => {
    const service = create();
    service.setTheme('light');
    const seen: string[] = [];

    for (let i = 0; i < 3; i++) {
      service.toggleTheme();
      seen.push(service.preference());
    }

    expect(new Set(seen).size).toBe(3);
    expect(seen[2]).toBe('light');
  });

  it('guarda también lo que elige el ciclo', () => {
    const service = create();
    service.setTheme('light');
    service.toggleTheme();
    const afterToggle = service.preference();

    expect(create().preference()).toBe(afterToggle);
  });
});
