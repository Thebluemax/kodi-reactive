// ==========================================================================
// Files Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  FileItem,
  FileMedia,
  FileItemFactory,
  KodiFileResponse
} from './domain/entities/file-item.entity';

// Domain - Repository (interface)
export { FileRepository } from './domain/repositories/file.repository';

// Application - Use Cases
export { BrowseFilesUseCase } from './application/use-cases/browse-files.use-case';

// Infrastructure - Providers
export { FILE_PROVIDERS } from './files.providers';
