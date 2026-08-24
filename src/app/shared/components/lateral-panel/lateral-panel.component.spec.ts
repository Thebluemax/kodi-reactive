import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { LateralPanelComponent } from './lateral-panel.component';

@Component({
  standalone: true,
  imports: [LateralPanelComponent],
  template: `
    <app-lateral-panel
      panelId="test-panel"
      title="Detalle"
      [isOpen]="open()"
      (panelClosed)="closed.set(closed() + 1)"
    >
      <p class="proyectado">contenido</p>
    </app-lateral-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class HostComponent {
  readonly open = signal(false);
  readonly closed = signal(0);
}

describe('LateralPanelComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    // El panel se saca del fixture, asi que los de tests anteriores seguirian
    // en el documento y la consulta encontraria el que no es.
    document.querySelectorAll('app-lateral-panel').forEach(el => el.remove());

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('app-lateral-panel').forEach(el => el.remove());
  });

  function panel(): HTMLElement | null {
    return document.querySelector('app-lateral-panel .lateral-panel');
  }

  it('se cuelga de ion-app cuando existe, no de body', () => {
    // Ionic monta sus overlays en ion-app: colgando del mismo contenedor, el
    // z-index del panel compite con el de un modal en vez de quedar en
    // apilamientos separados.
    const appRoot = document.createElement('ion-app');
    document.body.appendChild(appRoot);

    const otro = TestBed.createComponent(HostComponent);
    otro.detectChanges();

    expect(appRoot.querySelector('app-lateral-panel')).not.toBeNull();

    otro.destroy();
    appRoot.remove();
  });

  it('cae a body si no hay ion-app', () => {
    expect(panel()).not.toBeNull();
  });

  it('proyecta el contenido', () => {
    expect(document.querySelector('app-lateral-panel .proyectado')).not.toBeNull();
  });

  it('parte cerrado', () => {
    expect(panel()?.classList.contains('lateral-panel--open')).toBeFalse();
  });

  it('se abre al pedirlo', () => {
    host.open.set(true);
    fixture.detectChanges();

    expect(panel()?.classList.contains('lateral-panel--open')).toBeTrue();
  });

  it('avisa al cerrarse', () => {
    host.open.set(true);
    fixture.detectChanges();
    const before = host.closed();

    host.open.set(false);
    fixture.detectChanges();

    expect(host.closed()).toBeGreaterThan(before);
  });

  it('se retira del DOM al destruirse', () => {
    fixture.destroy();

    expect(document.querySelector('app-lateral-panel')).toBeNull();
  });
});
