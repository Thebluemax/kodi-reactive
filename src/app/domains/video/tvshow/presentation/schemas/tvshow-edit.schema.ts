// ==========================================================================
// PRESENTATION - TVShow Edit Schema
// ==========================================================================
// Campos de VideoLibrary.SetTVShowDetails que tiene sentido corregir a mano.
//
// No hay campo de año: la API no admite escribir `year` para series, solo
// `premiered`. El año que la lista muestra lo deriva Kodi de esa fecha.
//
// Quedan fuera `ratings` y `uniqueid`, cuyos tipos son objetos y no valores
// planos, la contabilidad de reproduccion que Kodi mantiene sola, y `cast`,
// que la API no admite escribir en ningun medio.
// ==========================================================================

import { MediaEditSchema } from '@shared/types/media-edit-schema.type';
import { TVSHOW_STATUSES } from '../../domain/entities/tvshow.entity';

/** Etiquetas de los valores que la API acepta en `status`. */
const STATUS_LABELS: Record<(typeof TVSHOW_STATUSES)[number], string> = {
  'returning series': 'En emisión',
  'in production': 'En producción',
  planned: 'Planificada',
  cancelled: 'Cancelada',
  ended: 'Finalizada'
};

export const TVSHOW_EDIT_SCHEMA: MediaEditSchema = [
  { key: 'title', label: 'Título', kind: 'text' },
  { key: 'originalTitle', label: 'Título original', kind: 'text' },
  { key: 'sortTitle', label: 'Título de ordenación', kind: 'text',
    hint: 'Por el que se ordena, por ejemplo «Sopranos, Los»' },
  { key: 'plot', label: 'Sinopsis', kind: 'textarea' },
  {
    key: 'status',
    label: 'Estado',
    kind: 'select',
    hint: 'Kodi solo admite estos cinco valores',
    options: TVSHOW_STATUSES.map(value => ({ value, label: STATUS_LABELS[value] }))
  },
  { key: 'genre', label: 'Géneros', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'studio', label: 'Estudios', kind: 'string-list',
    hint: 'Separados por comas' },
  { key: 'tag', label: 'Etiquetas', kind: 'string-list',
    hint: 'Separadas por comas' },
  { key: 'premiered', label: 'Fecha de estreno', kind: 'text',
    hint: 'El año de la lista sale de aquí: la API no deja escribirlo aparte' },
  { key: 'runtime', label: 'Duración del episodio', kind: 'number',
    hint: 'En segundos, no en minutos: 45 minutos son 2700' },
  { key: 'rating', label: 'Valoración', kind: 'number',
    hint: 'La del scraper, admite decimales' },
  { key: 'userRating', label: 'Tu valoración', kind: 'number',
    hint: 'Entera, de 0 a 10' },
  { key: 'votes', label: 'Votos', kind: 'text',
    hint: 'Texto, no número: así lo declara la API' },
  { key: 'mpaa', label: 'Clasificación por edades', kind: 'text' },
  { key: 'imdbNumber', label: 'IMDb', kind: 'text' },
  { key: 'episodeGuide', label: 'Guía de episodios', kind: 'text',
    hint: 'La usa el scraper para localizar los episodios' }
];
