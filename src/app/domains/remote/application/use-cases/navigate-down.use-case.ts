// ==========================================================================
// APPLICATION USE CASE - Navigate Down
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InputRepository } from '../../domain/repositories/input.repository';

@Injectable({
  providedIn: 'root'
})
export class NavigateDownUseCase {
  private readonly inputRepository = inject(InputRepository);

  execute(): Observable<void> {
    return this.inputRepository.navigateDown();
  }
}
