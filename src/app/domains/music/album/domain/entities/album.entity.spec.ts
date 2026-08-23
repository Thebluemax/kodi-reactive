import { AlbumFactory, KodiAlbumResponse } from './album.entity';

describe('AlbumFactory', () => {
  const RAW: KodiAlbumResponse = {
    albumid: 7,
    label: 'Kid A',
    albumlabel: 'Parlophone',
    artist: ['Radiohead'],
    artistid: [1],
    genre: ['Electronic'],
    style: ['IDM'],
    theme: ['Alienation'],
    mood: ['Melancholic'],
    type: 'album',
    rating: 8.5,
    userrating: 9,
    votes: 120,
    year: 2000,
    sortartist: 'Radiohead',
    displayartist: 'Radiohead',
    isboxset: false,
    releasedate: '2000-10-02',
    originaldate: '2000',
    musicbrainzalbumid: 'mb-album',
    musicbrainzreleasegroupid: 'mb-group',
    musicbrainzalbumartistid: ['mb-artist'],
    thumbnail: 'image://cover/',
    fanart: '',
    dateadded: '2020-01-01',
    playcount: 3,
    description: 'Cuarto álbum',
    art: { thumb: 'image://cover/' }
  };

  it('mapea los campos que el editor sabe escribir', () => {
    const album = AlbumFactory.fromKodiResponse(RAW);

    expect(album.themes).toEqual(['Alienation']);
    expect(album.moods).toEqual(['Melancholic']);
    expect(album.type).toBe('album');
    expect(album.rating).toBe(8.5);
    expect(album.userRating).toBe(9);
    expect(album.votes).toBe(120);
    expect(album.sortArtist).toBe('Radiohead');
    expect(album.displayArtist).toBe('Radiohead');
    expect(album.isBoxSet).toBeFalse();
    expect(album.releaseDate).toBe('2000-10-02');
    expect(album.originalDate).toBe('2000');
    expect(album.musicBrainzAlbumId).toBe('mb-album');
    expect(album.musicBrainzReleaseGroupId).toBe('mb-group');
    expect(album.musicBrainzAlbumArtistIds).toEqual(['mb-artist']);
  });

  it('conserva el rating decimal del scraper', () => {
    // userrating es entero y rating no: redondear aqui perderia el valor real.
    expect(AlbumFactory.fromKodiResponse(RAW).rating).toBe(8.5);
  });

  it('no confunde false con ausente en isBoxSet', () => {
    const sinCaja = AlbumFactory.fromKodiResponse({ ...RAW, isboxset: undefined });

    expect(sinCaja.isBoxSet).toBeFalse();
  });

  it('rellena con valores vacíos lo que la lista no pide', () => {
    // getAlbums solo pide artist, artistid, thumbnail y year: el resto llega
    // ausente y no debe quedar undefined.
    const deLista = AlbumFactory.fromKodiResponse({
      albumid: 7,
      artist: ['Radiohead'],
      thumbnail: 'image://cover/',
      year: 2000
    });

    expect(deLista.themes).toEqual([]);
    expect(deLista.type).toBe('');
    expect(deLista.rating).toBe(0);
    expect(deLista.art).toEqual({});
  });
});
