// ==========================================================================
// APPLICATION USE CASE - Context Menu
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InputRepository } from '../../domain/repositories/input.repository';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuUseCase {
  private readonly inputRepository = inject(InputRepository);

  execute(): Observable<void> {
    return this.inputRepository.contextMenu();
  }
}
