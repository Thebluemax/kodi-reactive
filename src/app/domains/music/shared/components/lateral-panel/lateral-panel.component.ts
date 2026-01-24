import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  inject,
  input,
  output,
  signal,
  effect
} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-lateral-panel',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon
  ],
  templateUrl: './lateral-panel.component.html',
  styleUrl: './lateral-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LateralPanelComponent implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);

  // Inputs
  readonly panelId = input.required<string>();
  readonly title = input<string>('');
  readonly customWidth = input<string>('300px');
  readonly isOpen = input<boolean>(false);

  // Outputs
  readonly panelClosed = output<void>();

  // Internal state
  readonly width = signal<number>(300);
  private grabbing = signal<boolean>(false);
  private oldX = 0;
  private hostElement!: HTMLElement;
  private panelElement!: HTMLElement;

  constructor() {
    // Watch for isOpen signal changes
    effect(() => {
      const open = this.isOpen();
      if (this.panelElement) {
        if (open) {
          this.open();
        } else {
          this.close();
        }
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.grabbing()) return;
    this.resize(event.clientX - this.oldX);
    this.oldX = event.clientX;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.grabbing.set(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('lateral-panel__grabber')) {
      this.grabbing.set(true);
      this.oldX = event.clientX;
    }
  }

  ngOnInit(): void {
    if (!this.panelId()) {
      console.error('LateralPanel must have a panelId');
      return;
    }

    this.hostElement = this.el.nativeElement;
    this.panelElement = this.hostElement.querySelector('.lateral-panel') as HTMLElement;
    this.width.set(this.parseWidth(this.customWidth()));
    this.constrainWidth();

    document.body.appendChild(this.hostElement);

    this.hostElement.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('lateral-panel__overlay')) {
        this.close();
      }
    });

    // Apply initial state if isOpen was already true
    if (this.isOpen()) {
      this.open();
    }
  }

  ngOnDestroy(): void {
    this.hostElement?.remove();
  }

  open(): void {
    this.panelElement?.classList.add('lateral-panel--open');
  }

  close(): void {
    this.panelElement?.classList.remove('lateral-panel--open');
    this.panelClosed.emit();
  }

  private resize(offsetX: number): void {
    this.width.update(w => w - offsetX);
  }

  private constrainWidth(): void {
    const browserWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );

    if (this.width() > browserWidth) {
      this.width.set(browserWidth);
    }
  }

  private parseWidth(width: string): number {
    if (width.includes('px')) {
      return parseInt(width.replace('px', ''), 10);
    }
    if (width.includes('%')) {
      const percentage = parseInt(width.replace('%', ''), 10);
      return (document.documentElement.offsetWidth * percentage) / 100;
    }
    return 300;
  }
}
