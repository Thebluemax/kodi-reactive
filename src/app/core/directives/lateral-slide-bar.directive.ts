import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appLateralSlideBar]',
  standalone: true,
})
export class LateralSlideBarDirective implements OnInit, OnChanges, OnDestroy {
  private element: any;
  private width: number = 300;
  @Input() openSlideBar: boolean = true;
  constructor(private el: ElementRef) {
    this.element = el.nativeElement;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['openSlideBar'] && changes['openSlideBar'].currentValue) {
      this.open();
    } else {
      this.close();
    }
  }

  ngOnInit() {
    const sidebar = this;
    this.width = 300;
    const browserWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
    if (this.width > browserWidth) {
      this.width = browserWidth;
      this.setSidebarWidth(this.width);
    }

    document.body.appendChild(this.element);
  }

  ngOnDestroy() {
    this.element.remove();
  }

  private setSidebarWidth(width: number) {
    localStorage.setItem('sidebar_width', width.toString());
  }
  public open(): void {
    this.element.classList.add('sidebar__open');
  }
  public close(): void {
    this.element.classList.remove('sidebar__open');
  }
}
