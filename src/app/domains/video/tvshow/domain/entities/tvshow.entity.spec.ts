import { TVShowFactory, KodiTVShowResponse, TVSHOW_STATUSES } from './tvshow.entity';

describe('TVShowFactory', () => {
  const RAW: KodiTVShowResponse = {
    tvshowid: 5,
    title: 'Los Soprano',
    originaltitle: 'The Sopranos',
    sorttitle: 'Soprano, Los',
    genre: ['Drama'],
    year: 1999,
    premiered: '1999-01-10',
    rating: 9.2,
    userrating: 9,
    votes: '450.000',
    plot: 'Un jefe mafioso en terapia',
    studio: ['HBO'],
    tag: ['mafia'],
    mpaa: 'TV-MA',
    imdbnumber: 'tt0141842',
    episodeguide: 'https://guia',
    status: 'ended',
    runtime: 3300,
    season: 6,
    episode: 86,
    thumbnail: 'image://poster/',
    fanart: '',
    art: { poster: 'image://poster/' },
    file: 'smb://nas/series/Los Soprano/'
  };

  it('mapea los campos que el editor sabe escribir', () => {
    const tvshow = TVShowFactory.fromKodiResponse(RAW);

    expect(tvshow.originalTitle).toBe('The Sopranos');
    expect(tvshow.sortTitle).toBe('Soprano, Los');
    expect(tvshow.premiered).toBe('1999-01-10');
    expect(tvshow.episodeGuide).toBe('https://guia');
    expect(tvshow.status).toBe('ended');
    expect(tvshow.art).toEqual({ poster: 'image://poster/' });
  });

  it('lleva la carpeta de la serie, que la API expone y no se escribe', () => {
    expect(TVShowFactory.fromKodiResponse(RAW).file).toBe('smb://nas/series/Los Soprano/');
  });

  it('conserva los votos como cadena', () => {
    expect(TVShowFactory.fromKodiResponse(RAW).votes).toBe('450.000');
  });

  it('sigue exponiendo el año, que la API no deja escribir', () => {
    // year es de lectura para series: SetTVShowDetails solo acepta premiered.
    expect(TVShowFactory.fromKodiResponse(RAW).year).toBe(1999);
  });

  it('rellena con vacíos lo que la lista no pide', () => {
    const deLista = TVShowFactory.fromKodiResponse({
      tvshowid: 5,
      title: 'Los Soprano',
      genre: ['Drama'],
      year: 1999
    });

    expect(deLista.status).toBe('');
    expect(deLista.premiered).toBe('');
    expect(deLista.tag).toEqual([]);
    expect(deLista.art).toEqual({});
  });

  it('declara los cinco estados que la API acepta', () => {
    expect(TVSHOW_STATUSES).toEqual([
      'returning series',
      'in production',
      'planned',
      'cancelled',
      'ended'
    ]);
  });
});
