// ==========================================================================
// APPLICATION USE CASE - Navigate Right
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InputRepository } from '../../domain/repositories/input.repository';

@Injectable({
  providedIn: 'root'
})
export class NavigateRightUseCase {
  private readonly inputRepository = inject(InputRepository);

  execute(): Observable<void> {
    return this.inputRepository.navigateRight();
  }
}
