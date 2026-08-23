import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let toastController: jasmine.SpyObj<ToastController>;
  let toast: jasmine.SpyObj<HTMLIonToastElement>;

  beforeEach(() => {
    toast = jasmine.createSpyObj<HTMLIonToastElement>('HTMLIonToastElement', ['present']);
    toast.present.and.resolveTo();

    toastController = jasmine.createSpyObj<ToastController>('ToastController', ['create']);
    toastController.create.and.resolveTo(toast);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastController, useValue: toastController },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('presenta el toast que crea', async () => {
    await service.success('guardado');

    expect(toastController.create).toHaveBeenCalledTimes(1);
    expect(toast.present).toHaveBeenCalledTimes(1);
  });

  it('pasa el mensaje sin tocarlo', async () => {
    await service.error('Kodi no respondió');

    expect(toastController.create.calls.mostRecent().args[0]?.message).toBe('Kodi no respondió');
  });

  it('distingue el error del éxito por color e icono', async () => {
    await service.success('listo');
    const success = toastController.create.calls.mostRecent().args[0];

    await service.error('falló');
    const error = toastController.create.calls.mostRecent().args[0];

    expect(success?.color).toBe('success');
    expect(error?.color).toBe('danger');
    expect(success?.icon).not.toBe(error?.icon);
  });

  it('deja el error más tiempo en pantalla que el éxito', async () => {
    await service.success('listo');
    const success = toastController.create.calls.mostRecent().args[0];

    await service.error('falló');
    const error = toastController.create.calls.mostRecent().args[0];

    expect(error?.duration).toBeGreaterThan(success?.duration ?? 0);
  });

  it('usa un color propio para la información', async () => {
    await service.info('escaneando');

    expect(toastController.create.calls.mostRecent().args[0]?.color).toBe('medium');
  });
});
