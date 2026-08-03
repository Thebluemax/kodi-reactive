// ==========================================================================
// DOMAIN ENTITY - Library Event
// ==========================================================================

import { LibraryType, LibraryOperation } from './library-type.entity';

/**
 * Fase de una operación de mantenimiento notificada por Kodi
 */
export enum LibraryEventPhase {
  Started = 'started',
  Finished = 'finished'
}

/**
 * Evento emitido por Kodi durante un escaneo o limpieza de biblioteca
 */
export interface LibraryEvent {
  readonly type: LibraryType;
  readonly operation: LibraryOperation;
  readonly phase: LibraryEventPhase;
}

/**
 * Factory de eventos de biblioteca
 */
export const LibraryEventFactory = {
  create(
    type: LibraryType,
    operation: LibraryOperation,
    phase: LibraryEventPhase
  ): LibraryEvent {
    return { type, operation, phase };
  }
};
