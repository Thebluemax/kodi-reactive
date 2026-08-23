import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MediaPathComponent } from './media-path.component';

describe('MediaPathComponent', () => {
  let fixture: ComponentFixture<MediaPathComponent>;
  let component: MediaPathComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaPathComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaPathComponent);
    component = fixture.componentInstance;
  });

  function render(inputs: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('muestra la ruta tal cual la devuelve Kodi', () => {
    render({ path: 'smb://nas/cine/Padrino/padrino.mkv' });

    expect(text()).toContain('smb://nas/cine/Padrino/padrino.mkv');
  });

  it('no pinta nada si no hay ruta ni mensaje', () => {
    render({ path: '' });

    expect(component.hasPath()).toBeFalse();
    expect(text().trim()).toBe('');
  });

  it('una ruta en blanco cuenta como ausente', () => {
    render({ path: '   ' });

    expect(component.hasPath()).toBeFalse();
  });

  it('muestra el mensaje alternativo cuando no hay ruta', () => {
    render({ path: '', emptyMessage: 'Las pistas están repartidas' });

    expect(text()).toContain('Las pistas están repartidas');
  });

  it('el mensaje alternativo no sustituye a una ruta existente', () => {
    render({ path: 'smb://nas/x.mkv', emptyMessage: 'No debería verse' });

    expect(text()).not.toContain('No debería verse');
  });

  it('avisa cuando la ruta es deducida y no devuelta por Kodi', () => {
    render({ path: 'smb://nas/musica/Kid A/', derived: true });

    expect(text()).toContain('deducida');
  });

  it('no avisa de nada cuando la ruta viene de Kodi', () => {
    render({ path: 'smb://nas/musica/Kid A/', derived: false });

    expect(text()).not.toContain('deducida');
  });

  it('no ofrece ningún control de edición', () => {
    render({ path: 'smb://nas/cine/padrino.mkv' });
    const host = fixture.nativeElement as HTMLElement;

    // La ruta es solo lectura: la API tampoco permite escribirla.
    expect(host.querySelector('input')).toBeNull();
    expect(host.querySelector('ion-input')).toBeNull();
  });
});
