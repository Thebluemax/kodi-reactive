import { ArtistFactory, KodiArtistResponse } from './artist.entity';

describe('ArtistFactory', () => {
  const RAW: KodiArtistResponse = {
    artistid: 3,
    artist: 'Radiohead',
    label: 'Radiohead',
    genre: ['Rock'],
    style: ['Alternative'],
    mood: ['Melancholic'],
    instrument: ['Guitar'],
    yearsactive: ['1985-'],
    born: '',
    formed: '1985',
    description: 'Banda británica',
    musicbrainzartistid: ['mb-1', 'mb-2'],
    sortname: 'Radiohead',
    type: 'Group',
    gender: '',
    disambiguation: 'banda británica',
    thumbnail: 'image://thumb/',
    fanart: '',
    art: { thumb: 'image://thumb/' }
  };

  it('mapea los campos que el editor sabe escribir', () => {
    const artist = ArtistFactory.fromKodiResponse(RAW);

    expect(artist.sortName).toBe('Radiohead');
    expect(artist.type).toBe('Group');
    expect(artist.disambiguation).toBe('banda británica');
    expect(artist.art).toEqual({ thumb: 'image://thumb/' });
  });

  it('conserva la lista completa de MusicBrainz que Kodi devuelve', () => {
    // La API lee un array y escribe una cadena: el desfase se resuelve en la
    // presentacion, no perdiendo datos aqui.
    expect(ArtistFactory.fromKodiResponse(RAW).musicBrainzId).toEqual(['mb-1', 'mb-2']);
  });

  it('rellena con vacíos lo que la lista no pide', () => {
    const deLista = ArtistFactory.fromKodiResponse({
      artistid: 3,
      artist: 'Radiohead',
      thumbnail: 'image://thumb/'
    });

    expect(deLista.sortName).toBe('');
    expect(deLista.type).toBe('');
    expect(deLista.gender).toBe('');
    expect(deLista.art).toEqual({});
  });
});
