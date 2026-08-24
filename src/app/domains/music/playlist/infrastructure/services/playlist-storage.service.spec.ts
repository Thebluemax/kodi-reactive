import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PlaylistStorageService } from './playlist-storage.service';
import { PlaylistItem } from '../../domain/entities/playlist-item.entity';

const STORAGE_KEY = 'kodi_saved_playlists';

const ITEM = { id: 1, label: 'Una pista' } as unknown as PlaylistItem;

describe('PlaylistStorageService', () => {
  let service: PlaylistStorageService;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });

    service = TestBed.inject(PlaylistStorageService);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('parte sin listas guardadas', () => {
    expect(service.getAllPlaylists()).toEqual([]);
  });

  it('guarda y recupera una lista', () => {
    const saved = service.savePlaylist('Para correr', [ITEM]);

    expect(service.getAllPlaylists().length).toBe(1);
    expect(service.getPlaylistById(saved.id)?.name).toBe('Para correr');
  });

  it('no pierde las anteriores al guardar otra', () => {
    service.savePlaylist('Una', [ITEM]);
    service.savePlaylist('Otra', [ITEM]);

    expect(service.getAllPlaylists().length).toBe(2);
  });

  it('sobrevive a un almacenamiento corrupto en vez de reventar', () => {
    // Basta que alguien toque el almacenamiento a mano para dejarlo asi, y no
    // puede tumbar la pantalla de listas guardadas.
    localStorage.setItem(STORAGE_KEY, 'esto no es json');

    expect(service.getAllPlaylists()).toEqual([]);
  });

  it('devuelve null si el identificador no existe', () => {
    expect(service.getPlaylistById('no-existe')).toBeNull();
  });

  describe('borrar', () => {
    it('quita la lista y lo confirma', () => {
      const saved = service.savePlaylist('Para correr', [ITEM]);

      expect(service.deletePlaylist(saved.id)).toBeTrue();
      expect(service.getAllPlaylists()).toEqual([]);
    });

    it('avisa cuando no hay nada que borrar', () => {
      expect(service.deletePlaylist('no-existe')).toBeFalse();
    });

    it('no toca las demás', () => {
      const first = service.savePlaylist('Una', [ITEM]);
      service.savePlaylist('Otra', [ITEM]);

      service.deletePlaylist(first.id);

      expect(service.getAllPlaylists().length).toBe(1);
      expect(service.getAllPlaylists()[0].name).toBe('Otra');
    });
  });

  describe('actualizar', () => {
    it('cambia solo el nombre si es lo único que llega', () => {
      const saved = service.savePlaylist('Vieja', [ITEM]);

      const updated = service.updatePlaylist(saved.id, 'Nueva');

      expect(updated?.name).toBe('Nueva');
      expect(updated?.items.length).toBe(1);
    });

    it('cambia solo los elementos si es lo único que llega', () => {
      const saved = service.savePlaylist('Vieja', [ITEM]);

      const updated = service.updatePlaylist(saved.id, undefined, []);

      expect(updated?.name).toBe('Vieja');
      expect(updated?.items).toEqual([]);
    });

    it('deja constancia de cuándo se tocó', () => {
      const saved = service.savePlaylist('Vieja', [ITEM]);

      const updated = service.updatePlaylist(saved.id, 'Nueva');

      expect(updated?.updatedAt).toBeTruthy();
    });

    it('devuelve null si no existe', () => {
      expect(service.updatePlaylist('no-existe', 'X')).toBeNull();
    });
  });
});
