import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import {
  MediaRefreshModalComponent,
  MediaRefreshRequest
} from './media-refresh-modal.component';

const INITIAL: MediaRefreshRequest = {
  title: 'El Padrino',
  year: '1972',
  uniqueId: 'tt0068646',
  ignoreNfo: false,
  refreshEpisodes: false
};

describe('MediaRefreshModalComponent', () => {
  let fixture: ComponentFixture<MediaRefreshModalComponent>;
  let component: MediaRefreshModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaRefreshModalComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaRefreshModalComponent);
    fixture.componentRef.setInput('initial', INITIAL);
    fixture.componentRef.setInput('showYear', true);
    fixture.componentRef.setInput('showUniqueId', true);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  function capture(): MediaRefreshRequest | undefined {
    let request: MediaRefreshRequest | undefined;
    component.confirmed.subscribe(value => (request = value));
    component.onConfirm();
    return request;
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('parte de los valores del medio', () => {
    expect(component.title()).toBe('El Padrino');
    expect(component.year()).toBe('1972');
    expect(component.uniqueId()).toBe('tt0068646');
  });

  it('cada casilla dice para qué sirve', () => {
    // El ion-alert renderizaba las casillas como cajas de texto y descartaba su
    // label, que es lo que llevo a sacar esto a un modal propio.
    expect(text()).toContain('Ignorar el archivo NFO local');
    expect(text()).toContain('Actívalo si es el NFO lo que está mal');
  });

  it('adelanta lo que Kodi acabará buscando', () => {
    expect(component.searchPreview()).toBe('El Padrino (1972)');
  });

  it('no duplica el año que el título ya trae', () => {
    component.title.set('El Padrino (1972)');

    expect(component.searchPreview()).toBe('El Padrino (1972)');
  });

  it('sin título avisa de que Kodi lo deducirá del archivo', () => {
    component.title.set('');

    expect(component.searchPreview()).toContain('deducirá del nombre del archivo');
  });

  it('emite lo tecleado, recortado', () => {
    component.title.set('  Amnesiac  ');
    component.ignoreNfo.set(true);

    expect(capture()).toEqual(
      jasmine.objectContaining({ title: 'Amnesiac', ignoreNfo: true })
    );
  });

  it('oculta los campos que no apliquen al medio', () => {
    fixture.componentRef.setInput('showUniqueId', false);
    fixture.componentRef.setInput('showYear', false);
    fixture.detectChanges();

    expect(text()).not.toContain('tt0068646');
  });

  it('descarta lo tecleado si cambia el medio', () => {
    component.title.set('Otra cosa');

    fixture.componentRef.setInput('initial', { ...INITIAL, title: 'Amnesiac' });
    fixture.detectChanges();

    expect(component.title()).toBe('Amnesiac');
  });
});
