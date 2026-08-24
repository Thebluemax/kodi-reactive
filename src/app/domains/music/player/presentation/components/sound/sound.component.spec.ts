import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { SoundComponent } from './sound.component';
import { ToggleMuteUseCase } from '@domains/music/player';

describe('SoundComponent', () => {
  let fixture: ComponentFixture<SoundComponent>;
  let component: SoundComponent;
  let toggleMute: { execute: jasmine.Spy };

  beforeEach(async () => {
    toggleMute = { execute: jasmine.createSpy('execute').and.returnValue(of(void 0)) };

    await TestBed.configureTestingModule({
      imports: [SoundComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToggleMuteUseCase, useValue: toggleMute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setInputs(volume: number, isMute = false): void {
    fixture.componentRef.setInput('volume', volume);
    fixture.componentRef.setInput('isMute', isMute);
    fixture.detectChanges();
  }

  describe('icono', () => {
    it('el silencio manda sobre el nivel', () => {
      // Silenciado con el volumen alto sigue siendo silencio: mostrar el icono
      // de volumen alto diria lo contrario de lo que pasa.
      setInputs(80, true);

      expect(component.volumeIcon()).toBe('volume-mute-outline');
    });

    it('distingue el cero del volumen bajo', () => {
      setInputs(0);
      const atZero = component.volumeIcon();

      setInputs(20);

      expect(atZero).toBe('volume-off');
      expect(component.volumeIcon()).toBe('volume-low');
    });

    it('cambia a alto a partir de la mitad', () => {
      setInputs(49);
      const below = component.volumeIcon();

      setInputs(50);

      expect(below).toBe('volume-low');
      expect(component.volumeIcon()).toBe('volume-high');
    });
  });

  it('emite el volumen que llega del deslizador', () => {
    let emitted = -1;
    component.volumeChange.subscribe(value => (emitted = value));

    component.setVolume(new CustomEvent('ionChange', { detail: { value: 65 } }));

    expect(emitted).toBe(65);
  });

  it('silenciar llega a Kodi', () => {
    component.muteVolume();

    expect(toggleMute.execute).toHaveBeenCalledWith();
  });

  describe('desplegable', () => {
    it('parte cerrado', () => {
      expect(component.isOpen()).toBeFalse();
    });

    it('se abre y se cierra con el mismo gesto', () => {
      component.togglePopup();
      const afterOpen = component.isOpen();

      component.togglePopup();

      expect(afterOpen).toBeTrue();
      expect(component.isOpen()).toBeFalse();
    });

    it('se coloca respecto al botón que lo abre', () => {
      // Va posicionado a mano porque flota sobre la barra: sin recalcularlo
      // aparecería donde estuvo la última vez.
      component.togglePopup();

      expect(component.popupPosition().bottom).toBeGreaterThan(0);
    });
  });
});
