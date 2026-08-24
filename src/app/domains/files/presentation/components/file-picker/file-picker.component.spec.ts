import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { FilePickerComponent } from './file-picker.component';
import { BrowseFilesUseCase } from '../../../application/use-cases/browse-files.use-case';
import { FileItem, FileMedia } from '../../../domain/entities/file-item.entity';

function item(partial: Partial<FileItem>): FileItem {
  return {
    path: 'smb://nas/fotos/',
    label: 'Fotos',
    isDirectory: true,
    mimeType: '',
    ...partial
  };
}

const SOURCE = item({ path: 'smb://nas/fotos/', label: 'Fotos' });
const FOLDER = item({ path: 'smb://nas/fotos/2020/', label: '2020' });
const IMAGE = item({
  path: 'smb://nas/fotos/cover.jpg',
  label: 'cover.jpg',
  isDirectory: false,
  mimeType: 'image/jpeg'
});
const OTHER = item({
  path: 'smb://nas/fotos/notas.txt',
  label: 'notas.txt',
  isDirectory: false,
  mimeType: 'text/plain'
});

describe('FilePickerComponent', () => {
  let fixture: ComponentFixture<FilePickerComponent>;
  let component: FilePickerComponent;
  let browse: jasmine.SpyObj<BrowseFilesUseCase>;

  beforeEach(async () => {
    browse = jasmine.createSpyObj<BrowseFilesUseCase>('BrowseFilesUseCase', [
      'sources',
      'directory',
      'downloadUrl'
    ]);
    browse.sources.and.returnValue(of([SOURCE]));
    browse.directory.and.returnValue(of([FOLDER, IMAGE, OTHER]));
    browse.downloadUrl.and.returnValue(of('http://kodi.local:8080/image/cover'));

    await TestBed.configureTestingModule({
      imports: [FilePickerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BrowseFilesUseCase, useValue: browse }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilePickerComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('arranca listando las fuentes reales de Kodi', () => {
    expect(browse.sources).toHaveBeenCalledWith(FileMedia.Pictures);
    expect(component.items()).toEqual([SOURCE]);
  });

  it('entra en una carpeta y deja rastro para volver', () => {
    component.onOpen(SOURCE);

    expect(browse.directory).toHaveBeenCalledWith(SOURCE.path, FileMedia.Pictures);
    expect(component.canGoBack()).toBeTrue();
    expect(component.currentLabel()).toBe('Fotos');
  });

  it('filtra lo que no es carpeta ni imagen', () => {
    component.onOpen(SOURCE);

    expect(component.items()).toEqual([FOLDER, IMAGE]);
  });

  it('reconoce la imagen por extensión cuando no hay mimetype', () => {
    const sinMime = item({
      path: 'smb://nas/fotos/back.PNG',
      label: 'back.PNG',
      isDirectory: false,
      mimeType: ''
    });
    browse.directory.and.returnValue(of([sinMime]));

    component.onOpen(SOURCE);

    expect(component.items()).toEqual([sinMime]);
  });

  it('previsualiza el archivo antes de asignarlo', () => {
    component.onOpen(SOURCE);
    component.onOpen(IMAGE);

    expect(browse.downloadUrl).toHaveBeenCalledWith(IMAGE.path);
    expect(component.preview()?.url).toBe('http://kodi.local:8080/image/cover');
  });

  it('emite la ruta de Kodi, no la URL de descarga', () => {
    let emitted = '';
    component.selected.subscribe(path => (emitted = path));

    component.onOpen(SOURCE);
    component.onOpen(IMAGE);
    component.onConfirm();

    // La de descarga sirve para mirar; la que se guarda es la del archivo.
    expect(emitted).toBe(IMAGE.path);
  });

  it('vuelve a las fuentes al retroceder desde la primera carpeta', () => {
    component.onOpen(SOURCE);
    browse.sources.calls.reset();

    component.onBack();

    expect(browse.sources).toHaveBeenCalledTimes(1);
    expect(component.canGoBack()).toBeFalse();
  });

  it('comunica el fallo en vez de dejar la lista en blanco sin más', () => {
    browse.directory.and.returnValue(throwError(() => new Error('Fuente no disponible')));

    component.onOpen(SOURCE);

    expect(component.error()).toBe('Fuente no disponible');
    expect(component.items()).toEqual([]);
  });

  it('distingue una carpeta vacía de una que aún carga', () => {
    browse.directory.and.returnValue(of([]));

    component.onOpen(SOURCE);

    expect(component.isEmpty()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });
});
