import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { FileKodiRepository } from './file-kodi.repository';
import { FileItem, FileMedia } from '../../domain/entities/file-item.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';
const HTTP_BASE_URL = 'http://kodi.local:8080';

describe('FileKodiRepository', () => {
  let repository: FileKodiRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: KodiConfigService,
          useValue: { jsonRpcUrl: JSON_RPC_URL, httpBaseUrl: HTTP_BASE_URL }
        }
      ]
    });

    repository = TestBed.inject(FileKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flush(body: object): { method: string; params: Record<string, unknown> } {
    const req = httpMock.expectOne(JSON_RPC_URL);
    const sent = req.request.body as { method: string; params: Record<string, unknown> };
    req.flush(body);
    return sent;
  }

  describe('getSources', () => {
    it('pide las fuentes de la ventana indicada', () => {
      repository.getSources(FileMedia.Pictures).subscribe();

      const sent = flush({ id: 1, jsonrpc: '2.0', result: { sources: [] } });

      expect(sent.method).toBe(Methods.FilesGetSources);
      expect(sent.params['media']).toBe('pictures');
    });

    it('trata las fuentes como carpetas, que no traen filetype', () => {
      let items: FileItem[] = [];
      repository.getSources(FileMedia.Pictures).subscribe(result => (items = result));

      flush({
        id: 1,
        jsonrpc: '2.0',
        result: { sources: [{ file: 'smb://nas/fotos/', label: 'Fotos' }] }
      });

      expect(items).toEqual([
        jasmine.objectContaining({ path: 'smb://nas/fotos/', label: 'Fotos', isDirectory: true })
      ]);
    });
  });

  describe('getDirectory', () => {
    it('distingue carpetas de archivos', () => {
      let items: FileItem[] = [];
      repository
        .getDirectory('smb://nas/fotos/', FileMedia.Pictures)
        .subscribe(result => (items = result));

      flush({
        id: 1,
        jsonrpc: '2.0',
        result: {
          files: [
            { file: 'smb://nas/fotos/2020/', label: '2020', filetype: 'directory' },
            { file: 'smb://nas/fotos/cover.jpg', label: 'cover.jpg', filetype: 'file', mimetype: 'image/jpeg' }
          ]
        }
      });

      expect(items.map(item => item.isDirectory)).toEqual([true, false]);
    });

    it('devuelve lista vacía cuando la carpeta no trae nada', () => {
      let items: FileItem[] | undefined;
      repository
        .getDirectory('smb://nas/vacia/', FileMedia.Pictures)
        .subscribe(result => {
          items = result;
        });

      flush({ id: 1, jsonrpc: '2.0', result: {} });

      expect(items).toEqual([]);
      expect(items).toBeDefined();
    });
  });

  describe('getDownloadUrl', () => {
    it('compone la URL con la base del servidor web de Kodi', () => {
      let url = '';
      repository.getDownloadUrl('smb://nas/fotos/cover.jpg').subscribe(result => (url = result));

      flush({
        id: 1,
        jsonrpc: '2.0',
        result: { protocol: 'http', mode: 'redirect', details: { path: 'image/smb%3a%2f%2fnas' } }
      });

      expect(url).toBe(`${HTTP_BASE_URL}/image/smb%3a%2f%2fnas`);
    });

    it('respeta una ruta que ya venga absoluta', () => {
      let url = '';
      repository.getDownloadUrl('http://host/cover.jpg').subscribe(result => (url = result));

      flush({
        id: 1,
        jsonrpc: '2.0',
        result: { details: { path: 'http://otro/cover.jpg' } }
      });

      expect(url).toBe('http://otro/cover.jpg');
    });

    it('falla si Kodi no devuelve ruta de descarga', () => {
      let caught: Error | undefined;
      repository.getDownloadUrl('smb://nas/x.jpg').subscribe({
        error: (err: Error) => (caught = err)
      });

      flush({ id: 1, jsonrpc: '2.0', result: { protocol: 'http', mode: 'redirect', details: {} } });

      expect(caught).toBeDefined();
    });
  });

  it('propaga el error del sobre, que llega con HTTP 200', () => {
    let caught: Error | undefined;
    repository.getSources(FileMedia.Pictures).subscribe({
      error: (err: Error) => (caught = err)
    });

    flush({ id: 1, jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' } });

    expect(caught?.message).toContain('Method not found');
  });
});
