// ==========================================================================
// PRESENTATION - Sound Component
// ==========================================================================

import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed, ElementRef, viewChild } from '@angular/core';
import { IonButton, IonIcon, IonRange } from '@ionic/angular/standalone';
import { ToggleMuteUseCase } from '../../../application/use-cases/toggle-mute.use-case';

@Component({
  selector: 'app-sound',
  standalone: true,
  imports: [IonButton, IonIcon, IonRange],
  templateUrl: './sound.component.html',
  styleUrl: './sound.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundComponent {
  private readonly toggleMuteUseCase = inject(ToggleMuteUseCase);

  // Inputs using signals
  readonly isMute = input<boolean>(false);
  readonly volume = input<number>(0);

  // Output using output()
  readonly volumeChange = output<number>();

  // Template refs
  private readonly triggerBtn = viewChild<ElementRef>('triggerBtn');

  // Local state
  readonly isOpen = signal<boolean>(false);
  readonly popupPosition = signal<{ bottom: number; right: number }>({ bottom: 100, right: 8 });

  // Computed icon
  readonly volumeIcon = computed(() => {
    if (this.isMute()) {
      return 'volume-mute-outline';
    } else if (this.volume() === 0) {
      return 'volume-off';
    } else if (this.volume() < 50) {
      return 'volume-low';
    } else {
      return 'volume-high';
    }
  });

  setVolume(event: Event): void {
    const value = (event as CustomEvent).detail.value as number;
    this.volumeChange.emit(value);
  }

  togglePopup(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      return;
    }

    const el = this.triggerBtn()?.nativeElement;
    if (el) {
      const rect = el.getBoundingClientRect();
      this.popupPosition.set({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }
    this.isOpen.set(true);
  }

  muteVolume(): void {
    this.toggleMuteUseCase.execute().subscribe();
  }
}
