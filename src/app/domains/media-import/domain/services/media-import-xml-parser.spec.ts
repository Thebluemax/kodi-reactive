import { parseImportXml } from './media-import-xml-parser';
import { MatchBy, MediaKind } from '../entities/media-import.entity';

describe('parseImportXml', () => {
  it('lee un NFO de película suelto', () => {
    const result = parseImportXml(`
      <movie>
        <title>El Padrino</title>
        <file>smb://nas/cine/padrino.mkv</file>
        <year>1972</year>
        <genre>Drama</genre>
      </movie>
    `);

    expect(result.issues).toEqual([]);
    expect(result.entries.length).toBe(1);
    expect(result.entries[0].kind).toBe(MediaKind.Movie);
    expect(result.entries[0].matchBy).toBe(MatchBy.File);
  });

  it('lee varios elementos envueltos en una raíz cualquiera', () => {
    const result = parseImportXml(`
      <biblioteca>
        <movie><file>a.mkv</file><year>1972</year></movie>
        <movie><file>b.mkv</file><year>1980</year></movie>
      </biblioteca>
    `);

    expect(result.entries.length).toBe(2);
  });

  it('rechaza el archivo entero si no es XML', () => {
    const result = parseImportXml('<movie><title>sin cerrar');

    expect(result.entries).toEqual([]);
    expect(result.issues[0].message).toContain('no es XML válido');
  });

  it('avisa si no hay ningún elemento reconocible', () => {
    const result = parseImportXml('<cosas><otra>1</otra></cosas>');

    expect(result.entries).toEqual([]);
    expect(result.issues.length).toBe(1);
  });

  it('agrupa las etiquetas repetidas en una lista', () => {
    const result = parseImportXml(`
      <movie><file>a.mkv</file><genre>Drama</genre><genre>Crimen</genre></movie>
    `);

    expect(result.entries[0].fields['genre']).toEqual(['Drama', 'Crimen']);
  });

  it('convierte a número lo que la API espera numérico', () => {
    const result = parseImportXml('<movie><file>a.mkv</file><year>1972</year></movie>');

    expect(result.entries[0].fields['year']).toBe(1972);
  });

  it('traduce los nombres del NFO a los del dominio', () => {
    const result = parseImportXml(`
      <movie>
        <file>a.mkv</file>
        <originaltitle>The Godfather</originaltitle>
        <plotoutline>Resumen</plotoutline>
      </movie>
    `);

    expect(result.entries[0].fields['originalTitle']).toBe('The Godfather');
    expect(result.entries[0].fields['plotOutline']).toBe('Resumen');
  });

  it('usa el plural en música y el singular en vídeo', () => {
    // La API llama genre en video y genre/genres segun el medio en musica: el
    // dominio ya distingue, y el parseo no puede unificarlos a la ligera.
    const movie = parseImportXml('<movie><file>a.mkv</file><genre>Drama</genre></movie>');
    const album = parseImportXml('<album><title>Kid A</title><genre>Electronic</genre></album>');

    expect(movie.entries[0].fields['genre']).toEqual(['Drama']);
    expect(album.entries[0].fields['genres']).toEqual(['Electronic']);
  });

  it('empareja álbum por título, que es lo único que la API expone', () => {
    const result = parseImportXml(`
      <album><title>Kid A</title><file>no-deberia-usarse</file><genre>Electronic</genre></album>
    `);

    expect(result.entries[0].matchBy).toBe(MatchBy.Title);
    expect(result.entries[0].matchValue).toBe('Kid A');
  });

  it('descarta las etiquetas con estructura propia', () => {
    // El reparto no es editable por la API, y traducirlo a medias seria peor
    // que no traducirlo.
    const result = parseImportXml(`
      <movie>
        <file>a.mkv</file>
        <year>1972</year>
        <actor><name>Al Pacino</name></actor>
      </movie>
    `);

    expect('actor' in result.entries[0].fields).toBeFalse();
  });

  it('ignora las etiquetas vacías en vez de escribir cadenas vacías', () => {
    const result = parseImportXml(
      '<movie><file>a.mkv</file><year>1972</year><tagline>  </tagline></movie>'
    );

    expect('tagline' in result.entries[0].fields).toBeFalse();
  });

  it('localiza el problema sin descartar el resto', () => {
    const result = parseImportXml(`
      <biblioteca>
        <movie><file>a.mkv</file><year>1972</year></movie>
        <movie><year>1980</year></movie>
      </biblioteca>
    `);

    expect(result.entries.length).toBe(1);
    expect(result.issues[0].index).toBe(1);
  });
});
