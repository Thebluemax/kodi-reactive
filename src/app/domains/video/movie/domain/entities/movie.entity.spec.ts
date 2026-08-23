import { MovieFactory, KodiMovieResponse } from './movie.entity';

describe('MovieFactory', () => {
  const RAW: KodiMovieResponse = {
    movieid: 11,
    title: 'El Padrino',
    originaltitle: 'The Godfather',
    sorttitle: 'Padrino, El',
    genre: ['Drama'],
    year: 1972,
    premiered: '1972-03-24',
    rating: 9.2,
    userrating: 10,
    votes: '1.900.000',
    top250: 1,
    runtime: 10500,
    plot: 'La familia Corleone…',
    plotoutline: 'Ascenso de Michael',
    director: ['Coppola'],
    writer: ['Puzo'],
    studio: ['Paramount'],
    country: ['Estados Unidos'],
    tag: ['mafia'],
    showlink: [],
    mpaa: 'R',
    imdbnumber: 'tt0068646',
    trailer: 'plugin://trailer',
    set: 'El Padrino',
    tagline: 'Una oferta que no podrás rechazar',
    thumbnail: 'image://poster/',
    fanart: '',
    art: { poster: 'image://poster/' }
  };

  it('mapea los campos que el editor sabe escribir', () => {
    const movie = MovieFactory.fromKodiResponse(RAW);

    expect(movie.originalTitle).toBe('The Godfather');
    expect(movie.sortTitle).toBe('Padrino, El');
    expect(movie.premiered).toBe('1972-03-24');
    expect(movie.set).toBe('El Padrino');
    expect(movie.top250).toBe(1);
    expect(movie.art).toEqual({ poster: 'image://poster/' });
  });

  it('conserva los votos como cadena', () => {
    // La API declara votes como Optional.String para pelicula, a diferencia de
    // album, donde es entero. Convertirlo a numero perderia el formato.
    expect(MovieFactory.fromKodiResponse(RAW).votes).toBe('1.900.000');
  });

  it('mantiene la duración en segundos, tal como la da Kodi', () => {
    expect(MovieFactory.fromKodiResponse(RAW).runtime).toBe(10500);
  });

  it('rellena con vacíos lo que la lista no pide', () => {
    const deLista = MovieFactory.fromKodiResponse({
      movieid: 11,
      title: 'El Padrino',
      genre: ['Drama'],
      year: 1972
    });

    expect(deLista.originalTitle).toBe('');
    expect(deLista.premiered).toBe('');
    expect(deLista.votes).toBe('');
    expect(deLista.tag).toEqual([]);
    expect(deLista.art).toEqual({});
  });
});
