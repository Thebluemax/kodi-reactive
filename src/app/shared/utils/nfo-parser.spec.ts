import { looksLikeXml, NfoKind, parseNfo } from './nfo-parser';

describe('looksLikeXml', () => {
  it('reconoce el XML por el contenido, no por la extensión', () => {
    expect(looksLikeXml('  \n<movie></movie>')).toBeTrue();
    expect(looksLikeXml('{ "title": "x" }')).toBeFalse();
  });
});

describe('parseNfo', () => {
  it('lee un NFO de película', () => {
    const result = parseNfo(`
      <movie>
        <title>El Padrino</title>
        <year>1972</year>
        <genre>Drama</genre>
      </movie>
    `);

    expect(result?.kind).toBe(NfoKind.Movie);
    expect(result?.fields['title']).toBe('El Padrino');
  });

  it('devuelve null si no es XML válido', () => {
    expect(parseNfo('<movie><title>sin cerrar')).toBeNull();
  });

  it('devuelve null si la raíz no es un medio conocido', () => {
    expect(parseNfo('<cosas><otra>1</otra></cosas>')).toBeNull();
  });

  it('agrupa las etiquetas repetidas en una lista', () => {
    const result = parseNfo(
      '<movie><genre>Drama</genre><genre>Crimen</genre></movie>'
    );

    expect(result?.fields['genre']).toEqual(['Drama', 'Crimen']);
  });

  it('convierte a número lo que la API espera numérico', () => {
    expect(parseNfo('<movie><year>1972</year></movie>')?.fields['year']).toBe(1972);
  });

  it('traduce los nombres del NFO a los del dominio', () => {
    const result = parseNfo(
      '<movie><originaltitle>The Godfather</originaltitle></movie>'
    );

    expect(result?.fields['originalTitle']).toBe('The Godfather');
  });

  it('usa el singular en vídeo y el plural en música', () => {
    // Las entidades arrastran la inconsistencia de la API: genre en video,
    // genres en musica.
    const movie = parseNfo('<movie><genre>Drama</genre></movie>');
    const album = parseNfo('<album><genre>Electronic</genre></album>');

    expect(movie?.fields['genre']).toEqual(['Drama']);
    expect(album?.fields['genres']).toEqual(['Electronic']);
  });

  it('traduce el sello del álbum', () => {
    expect(
      parseNfo('<album><albumlabel>Parlophone</albumlabel></album>')?.fields['label']
    ).toBe('Parlophone');
  });

  it('descarta las etiquetas con estructura propia', () => {
    // El reparto no es editable por la API, y traducirlo a medias seria peor.
    const result = parseNfo(
      '<movie><year>1972</year><actor><name>Al Pacino</name></actor></movie>'
    );

    expect('actor' in (result?.fields ?? {})).toBeFalse();
  });

  it('ignora las etiquetas vacías en vez de escribir cadenas vacías', () => {
    const result = parseNfo('<movie><year>1972</year><tagline>  </tagline></movie>');

    expect('tagline' in (result?.fields ?? {})).toBeFalse();
  });
});
