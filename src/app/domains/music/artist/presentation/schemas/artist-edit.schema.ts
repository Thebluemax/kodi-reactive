// ==========================================================================
// PRESENTATION - Artist Edit Schema
// ==========================================================================
// Los 16 campos que AudioLibrary.SetArtistDetails admite escribir, aparte del
// artwork, que lleva la seccion de imagenes del modal.
//
// Las fechas son texto libre: la API las declara Optional.String y Kodi no las
// valida, asi que un artista puede tener «1965» o «12 de marzo de 1965».
// ==========================================================================

import { MediaEditSchema } from '@shared/types/media-edit-schema.type';

export const ARTIST_EDIT_SCHEMA: MediaEditSchema = [
  { key: 'name', label: 'Nombre', kind: 'text' },
  { key: 'sortName', label: 'Nombre de ordenación', kind: 'text',
    hint: 'Por el que se ordena, por ejemplo «Beatles, The»' },
  { key: 'type', label: 'Tipo', kind: 'text',
    hint: 'Person, Group, Orchestra, Choir… tal como lo usa Kodi' },
  { key: 'gender', label: 'Género', kind: 'text' },
  { key: 'disambiguation', label: 'Desambiguación', kind: 'text',
    hint: 'Distingue homónimos, por ejemplo «banda británica de los 70»' },
  { key: 'description', label: 'Biografía', kind: 'textarea' },
  { key: 'genres', label: 'Géneros musicales', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'styles', label: 'Estilos', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'moods', label: 'Estados de ánimo', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'instruments', label: 'Instrumentos', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'born', label: 'Nacimiento', kind: 'text',
    hint: 'Texto libre, Kodi no lo valida como fecha' },
  { key: 'formed', label: 'Formación', kind: 'text',
    hint: 'Para grupos, texto libre' },
  { key: 'died', label: 'Fallecimiento', kind: 'text', hint: 'Texto libre' },
  { key: 'disbanded', label: 'Disolución', kind: 'text',
    hint: 'Para grupos, texto libre' },
  { key: 'yearsActive', label: 'Años en activo', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'musicBrainzId', label: 'MusicBrainz: artista', kind: 'text',
    hint: 'Kodi lo devuelve como lista pero solo admite escribir uno' }
];
