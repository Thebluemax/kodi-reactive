import { parseImportJson } from './media-import-parser';
import { MatchBy, MediaKind } from '../entities/media-import.entity';

describe('parseImportJson', () => {
  it('acepta una lista de entradas', () => {
    const result = parseImportJson(
      JSON.stringify([
        { kind: 'movie', file: 'smb://nas/cine/padrino.mkv', title: 'El Padrino' }
      ])
    );

    expect(result.issues).toEqual([]);
    expect(result.entries.length).toBe(1);
    expect(result.entries[0].kind).toBe(MediaKind.Movie);
  });

  it('acepta también un objeto con la clave items', () => {
    const result = parseImportJson(
      JSON.stringify({ items: [{ kind: 'movie', file: 'a.mkv', year: 1972 }] })
    );

    expect(result.entries.length).toBe(1);
  });

  it('rechaza el archivo entero si no es JSON', () => {
    const result = parseImportJson('{ esto no es json');

    expect(result.entries).toEqual([]);
    expect(result.issues[0].message).toContain('no es JSON válido');
  });

  it('rechaza el archivo entero si no hay lista', () => {
    const result = parseImportJson(JSON.stringify({ title: 'suelto' }));

    expect(result.entries).toEqual([]);
    expect(result.issues.length).toBe(1);
  });

  it('localiza el problema sin descartar el resto', () => {
    // Un archivo de cientos de entradas no puede caerse entero por una mala.
    const result = parseImportJson(
      JSON.stringify([
        { kind: 'movie', file: 'a.mkv', year: 1972 },
        { kind: 'inventado', file: 'b.mkv', year: 1980 },
        { kind: 'movie', file: 'c.mkv', year: 1990 }
      ])
    );

    expect(result.entries.length).toBe(2);
    expect(result.issues).toEqual([
      jasmine.objectContaining({ index: 1 })
    ]);
  });

  it('exige file o title para localizar el elemento', () => {
    const result = parseImportJson(JSON.stringify([{ kind: 'movie', year: 1972 }]));

    expect(result.entries).toEqual([]);
    expect(result.issues[0].message).toContain('«file» o «title»');
  });

  it('empareja por ruta cuando la hay', () => {
    const result = parseImportJson(
      JSON.stringify([{ kind: 'movie', file: 'a.mkv', title: 'El Padrino' }])
    );

    expect(result.entries[0].matchBy).toBe(MatchBy.File);
    expect(result.entries[0].matchValue).toBe('a.mkv');
  });

  it('con ruta, el título es un campo más que se escribe', () => {
    const result = parseImportJson(
      JSON.stringify([{ kind: 'movie', file: 'a.mkv', title: 'El Padrino' }])
    );

    expect(result.entries[0].fields['title']).toBe('El Padrino');
  });

  it('sin ruta, el título localiza y no se escribe', () => {
    // Quien empareja por titulo no puede a la vez renombrarlo: se quedaria sin
    // clave para la proxima importacion.
    const result = parseImportJson(
      JSON.stringify([{ kind: 'album', title: 'Kid A', genres: ['Electronic'] }])
    );

    expect(result.entries[0].matchBy).toBe(MatchBy.Title);
    expect('title' in result.entries[0].fields).toBeFalse();
    expect(result.entries[0].fields['genres']).toEqual(['Electronic']);
  });

  it('rechaza la ruta en medios que no la tienen en la API', () => {
    const result = parseImportJson(
      JSON.stringify([{ kind: 'album', file: 'smb://nas/musica/', genres: [] }])
    );

    expect(result.issues[0].message).toContain('no expone la ruta');
  });

  it('rechaza una entrada sin campos que escribir', () => {
    const result = parseImportJson(JSON.stringify([{ kind: 'movie', file: 'a.mkv' }]));

    expect(result.issues[0].message).toContain('ningún campo');
  });

  it('conserva la posición de cada entrada para poder señalarla', () => {
    const result = parseImportJson(
      JSON.stringify([
        { kind: 'movie', file: 'a.mkv', year: 1 },
        { kind: 'movie', file: 'b.mkv', year: 2 }
      ])
    );

    expect(result.entries.map(entry => entry.index)).toEqual([0, 1]);
  });
});
