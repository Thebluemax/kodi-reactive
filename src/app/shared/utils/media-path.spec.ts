import {
  commonFolder,
  fileName,
  folderOf,
  isSpreadAcrossFolders
} from './media-path';

describe('media-path', () => {
  describe('fileName', () => {
    it('extrae el nombre de una ruta de red', () => {
      expect(fileName('smb://nas/cine/Padrino/padrino.mkv')).toBe('padrino.mkv');
    });

    it('acepta separadores de Windows', () => {
      expect(fileName('C:\\Cine\\padrino.mkv')).toBe('padrino.mkv');
    });

    it('ignora la barra final de una carpeta', () => {
      expect(fileName('smb://nas/cine/Padrino/')).toBe('Padrino');
    });

    it('devuelve la propia cadena si no hay separadores', () => {
      expect(fileName('padrino.mkv')).toBe('padrino.mkv');
    });
  });

  describe('folderOf', () => {
    it('conserva el separador final', () => {
      expect(folderOf('smb://nas/musica/Kid A/01.flac')).toBe('smb://nas/musica/Kid A/');
    });

    it('devuelve vacío si la ruta no tiene carpeta', () => {
      expect(folderOf('01.flac')).toBe('');
    });
  });

  describe('commonFolder', () => {
    it('devuelve la carpeta cuando todas las pistas comparten una', () => {
      expect(
        commonFolder([
          'smb://nas/musica/Kid A/01.flac',
          'smb://nas/musica/Kid A/02.flac'
        ])
      ).toBe('smb://nas/musica/Kid A/');
    });

    it('devuelve vacío cuando están repartidas', () => {
      // Presentar una de las dos como «la carpeta del album» seria mentir.
      expect(
        commonFolder([
          'smb://nas/musica/Kid A/CD1/01.flac',
          'smb://nas/musica/Kid A/CD2/01.flac'
        ])
      ).toBe('');
    });

    it('ignora las rutas vacías', () => {
      expect(commonFolder(['', 'smb://nas/musica/Kid A/01.flac'])).toBe(
        'smb://nas/musica/Kid A/'
      );
    });

    it('devuelve vacío sin rutas', () => {
      expect(commonFolder([])).toBe('');
    });
  });

  describe('isSpreadAcrossFolders', () => {
    it('detecta las pistas repartidas', () => {
      expect(
        isSpreadAcrossFolders(['smb://a/1.flac', 'smb://b/1.flac'])
      ).toBeTrue();
    });

    it('una sola ruta no está repartida', () => {
      expect(isSpreadAcrossFolders(['smb://a/1.flac'])).toBeFalse();
    });

    it('sin rutas no está repartida', () => {
      expect(isSpreadAcrossFolders([])).toBeFalse();
    });
  });
});
