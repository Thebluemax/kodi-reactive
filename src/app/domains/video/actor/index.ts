// ==========================================================================
// Actor Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  Actor,
  ActorRole,
  ActorListResult,
  ActorFactory
} from './domain/entities/actor.entity';

// Domain - Repository (interface)
export { ActorRepository } from './domain/repositories/actor.repository';

// Application - Use Cases
export { GetActorsUseCase } from './application/use-cases/get-actors.use-case';
export { GetMoviesByActorUseCase } from './application/use-cases/get-movies-by-actor.use-case';

// Presentation - Components
export { ActorListComponent } from './presentation/components/actor-list/actor-list.component';
export { ActorDetailComponent } from './presentation/components/actor-detail/actor-detail.component';

// Infrastructure - Providers
export { ACTOR_PROVIDERS } from './actor.providers';
