import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MediaTileComponent } from './media-tile.component';
import { KodiConfigService } from '@shared/services/kodi-config.service';

describe('MediaTileComponent', () => {
  let fixture: ComponentFixture<MediaTileComponent>;
  let component: MediaTileComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaTileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiConfigService, useValue: { httpBaseUrl: 'http://kodi.local:8080' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function card(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('ion-card')!;
  }

  it('rellena la tarjeta por defecto', () => {
    // La caratula de album es cuadrada como la tarjeta: cover va bien.
    expect(component.backgroundSize()).toBe('cover');
    expect(component.backgroundPosition()).toBeNull();
  });

  it('no fija la posición en el modo por defecto', () => {
    // Dejar el estilo sin poner es lo que garantiza que album, actor y genero
    // se vean igual que antes del cambio.
    fixture.detectChanges();

    expect(card().style.backgroundPosition).toBe('');
  });

  it('muestra el cartel entero a lo alto y centrado', () => {
    fixture.componentRef.setInput('imageFit', 'height');
    fixture.detectChanges();

    expect(component.backgroundSize()).toBe('auto 100%');
    expect(card().style.backgroundSize).toBe('auto 100%');
    // El navegador normaliza `center` a `center center`.
    expect(card().style.backgroundPosition).toBe('center center');
  });

  it('mantiene la imagen de reserva en los dos modos', () => {
    fixture.componentRef.setInput('thumbnail', 'image://cover/');
    fixture.componentRef.setInput('imageFit', 'height');
    fixture.detectChanges();

    expect(card().style.backgroundImage).toContain('no_cover.png');
  });
});
