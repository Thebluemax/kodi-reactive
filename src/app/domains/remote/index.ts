// ==========================================================================
// Remote Domain - Public API
// ==========================================================================

// Domain - Entities
export { InputAction } from './domain/entities/input-action.entity';

// Domain - Repository (interface)
export { InputRepository } from './domain/repositories/input.repository';

// Application - Use Cases
export { NavigateUpUseCase } from './application/use-cases/navigate-up.use-case';
export { NavigateDownUseCase } from './application/use-cases/navigate-down.use-case';
export { NavigateLeftUseCase } from './application/use-cases/navigate-left.use-case';
export { NavigateRightUseCase } from './application/use-cases/navigate-right.use-case';
export { SelectUseCase } from './application/use-cases/select.use-case';
export { BackUseCase } from './application/use-cases/back.use-case';
export { GoHomeUseCase } from './application/use-cases/go-home.use-case';
export { ContextMenuUseCase } from './application/use-cases/context-menu.use-case';
export { ShowInfoUseCase } from './application/use-cases/show-info.use-case';

// Presentation - Components
export { RemoteControlComponent } from './presentation/components/remote-control/remote-control.component';

// Infrastructure - Providers
export { REMOTE_PROVIDERS } from './remote.providers';
