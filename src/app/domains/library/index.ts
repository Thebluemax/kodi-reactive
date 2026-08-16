// ==========================================================================
// Library Domain - Public API
// ==========================================================================

// Domain - Entities
export { LibraryType, LibraryOperation } from './domain/entities/library-type.entity';
export {
  LibraryEventPhase,
  LibraryEventFactory
} from './domain/entities/library-event.entity';
export type { LibraryEvent } from './domain/entities/library-event.entity';

// Domain - Repository (interface)
export { LibraryRepository } from './domain/repositories/library.repository';

// Application - Use Cases
export { ScanLibraryUseCase } from './application/use-cases/scan-library.use-case';
export { CleanLibraryUseCase } from './application/use-cases/clean-library.use-case';

// Application - Facade
export { LibraryFacade } from './application/library.facade';

// Infrastructure - Adapters
export { LibraryWebSocketAdapter } from './infrastructure/adapters/library-websocket.adapter';

// Infrastructure - Providers
export { LIBRARY_PROVIDERS } from './library.providers';
