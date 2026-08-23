// ==========================================================================
// PRESENTATION - Album Edit Schema
// ==========================================================================
// Campos editables del album, con la etiqueta y el tipo de control que el modal
// generico necesita. Las claves son las de AlbumUpdate, no las de la API: la
// traduccion vive en el repositorio.
//
// El esquema se limita a lo que la entidad Album carga hoy. AlbumFactory
// descarta type, mood, theme, rating y votes aunque getAlbumById si se los pide
// a Kodi, y AudioLibrary.SetAlbumDetails admite ademas los identificadores de
// MusicBrainz, las fechas de publicacion y isboxset. Exponerlos aqui mostraria
// cajas vacias para campos que en Kodi tienen valor, que es una invitacion a
// pisarlos sin querer. Ampliar la cobertura pasa antes por ampliar la entidad.
// ==========================================================================

import { MediaEditSchema } from '@shared/types/media-edit-schema.type';

export const ALBUM_EDIT_SCHEMA: MediaEditSchema = [
  { key: 'title', label: 'Título', kind: 'text' },
  { key: 'artists', label: 'Artistas', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'description', label: 'Descripción', kind: 'textarea' },
  { key: 'genres', label: 'Géneros', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'styles', label: 'Estilos', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'label', label: 'Sello', kind: 'text' },
  { key: 'year', label: 'Año', kind: 'number' }
];
