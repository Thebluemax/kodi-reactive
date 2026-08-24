// ==========================================================================
// PRESENTATION - Movie Edit Schema
// ==========================================================================
// Campos de VideoLibrary.SetMovieDetails que tiene sentido corregir a mano.
//
// Quedan fuera tres parametros cuyo tipo es un objeto y no un valor plano:
// `resume` (Video.Resume), `ratings` (Video.Ratings.Set) y `uniqueid`
// (Media.UniqueID.Set). El modal trabaja con campos planos, y esos tres piden
// una interfaz propia.
//
// Tambien queda fuera la contabilidad de reproduccion —`playcount`,
// `lastplayed`, `dateadded`—, que Kodi mantiene solo y no es metadato que se
// corrija en un editor.
//
// `cast` no aparece porque la API no lo admite escribir: es la razon por la que
// los actores no son editables.
// ==========================================================================

import { MediaEditSchema } from '@shared/types/media-edit-schema.type';

export const MOVIE_EDIT_SCHEMA: MediaEditSchema = [
  { key: 'title', label: 'Título', kind: 'text' },
  { key: 'originalTitle', label: 'Título original', kind: 'text' },
  { key: 'sortTitle', label: 'Título de ordenación', kind: 'text',
    hint: 'Por el que se ordena, por ejemplo «Padrino, El»' },
  { key: 'tagline', label: 'Eslogan', kind: 'text' },
  { key: 'plot', label: 'Sinopsis', kind: 'textarea' },
  { key: 'plotOutline', label: 'Resumen breve', kind: 'textarea' },
  { key: 'genre', label: 'Géneros', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'director', label: 'Dirección', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'writer', label: 'Guion', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'studio', label: 'Estudios', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'country', label: 'Países', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'tag', label: 'Etiquetas', kind: 'string-list',
    hint: 'Separadas por comas' },
  { key: 'set', label: 'Colección', kind: 'text',
    hint: 'Saga a la que pertenece, por ejemplo «El Padrino»' },
  { key: 'showlink', label: 'Series relacionadas', kind: 'string-list',
    hint: 'Separadas por comas' },
  { key: 'premiered', label: 'Fecha de estreno', kind: 'text',
    hint: 'Kodi la vincula con el año y esta manda: si cambias las dos, gana esta' },
  { key: 'year', label: 'Año', kind: 'number',
    hint: 'Se ignora si en el mismo guardado cambias la fecha de estreno' },
  { key: 'runtime', label: 'Duración', kind: 'number',
    hint: 'En segundos, no en minutos: 90 minutos son 5400' },
  { key: 'rating', label: 'Valoración', kind: 'number',
    hint: 'La del scraper, admite decimales' },
  { key: 'userRating', label: 'Tu valoración', kind: 'number',
    hint: 'Entera, de 0 a 10' },
  { key: 'votes', label: 'Votos', kind: 'text',
    hint: 'Texto, no número: así lo declara la API para película' },
  { key: 'top250', label: 'Puesto en el Top 250', kind: 'number' },
  { key: 'mpaa', label: 'Clasificación por edades', kind: 'text' },
  { key: 'imdbNumber', label: 'IMDb', kind: 'text' },
  { key: 'trailer', label: 'Tráiler', kind: 'text', hint: 'Ruta o URL' }
];
