// ==========================================================================
// PRESENTATION - Album Edit Schema
// ==========================================================================
// Los 22 campos que AudioLibrary.SetAlbumDetails admite escribir, con la
// etiqueta y el tipo de control que el modal generico necesita. Las claves son
// las de AlbumUpdate, no las de la API: la traduccion vive en el repositorio.
//
// El artwork no figura aqui: lo lleva la seccion de imagenes del modal, porque
// es un diccionario de claves abiertas y no un campo mas.
// ==========================================================================

import { MediaEditSchema } from '@shared/types/media-edit-schema.type';

export const ALBUM_EDIT_SCHEMA: MediaEditSchema = [
  { key: 'title', label: 'Título', kind: 'text' },
  { key: 'artists', label: 'Artistas', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'displayArtist', label: 'Artista mostrado', kind: 'text',
    hint: 'Como se presenta el artista, si difiere de la lista' },
  { key: 'sortArtist', label: 'Artista de ordenación', kind: 'text',
    hint: 'Por el que se ordena, por ejemplo «Beatles, The»' },
  { key: 'description', label: 'Descripción', kind: 'textarea' },
  { key: 'genres', label: 'Géneros', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'styles', label: 'Estilos', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'moods', label: 'Estados de ánimo', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'themes', label: 'Temas', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'type', label: 'Tipo', kind: 'text',
    hint: 'Álbum, EP, single, recopilatorio…' },
  { key: 'label', label: 'Sello', kind: 'text' },
  { key: 'year', label: 'Año', kind: 'number' },
  { key: 'releaseDate', label: 'Fecha de publicación', kind: 'text',
    hint: 'Texto libre, Kodi no la valida como fecha' },
  { key: 'originalDate', label: 'Fecha original', kind: 'text',
    hint: 'De la edición original, si esta es una reedición' },
  { key: 'rating', label: 'Valoración', kind: 'number',
    hint: 'La del scraper, admite decimales' },
  { key: 'userRating', label: 'Tu valoración', kind: 'number',
    hint: 'Entera, de 0 a 10' },
  { key: 'votes', label: 'Votos', kind: 'number' },
  { key: 'isBoxSet', label: 'Es una caja recopilatoria', kind: 'boolean' },
  { key: 'musicBrainzAlbumId', label: 'MusicBrainz: álbum', kind: 'text' },
  { key: 'musicBrainzReleaseGroupId', label: 'MusicBrainz: grupo de edición', kind: 'text' },
  { key: 'musicBrainzAlbumArtistIds', label: 'MusicBrainz: artistas', kind: 'string-list',
    hint: 'Separados por comas' }
];
