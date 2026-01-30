import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, SimpleChanges, OnChanges, Output, EventEmitter, inject, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SideBarService } from '@shared/services/side-bar.service';

@Component({
  selector: 'app-lateral-slide',
  standalone: true,
  imports: [IonicModule],
  providers: [SideBarService],
  templateUrl: './lateral-slide.component.html',
  styleUrls: ['./lateral-slide.component.scss'],
})
export class LateralSlideComponent implements OnInit, OnDestroy, OnChanges {
  private el = inject(ElementRef);

  public width: number = 300;
  public x = 100;
  public oldX = 0;
  public grabber = false;
  id = input<string>();
  title = input<string | undefined>();
  customWidth = input<string>('300px');
  openSlideBar = input<boolean>(false);
  closeSlideBar = output<any>();

  private element: any;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.grabber) {
      return;
    }
    this.resizer(event.clientX - this.oldX);
    this.oldX = event.clientX;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.grabber = false;
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: any) {
    if (event.target.className === 'sidebar__grabber') {
      this.grabber = true;
      this.oldX = event.clientX;
    }
  }

  constructor() {
    this.element = this.el.nativeElement;
  }

  ngOnInit() {
    const sidebar = this;
    if (!this.id) {
      console.error('Sidebar must have an ID');
      return;
    }

    this.width = this.parseCustomWidth(this.customWidth());
    const browserWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
    if (this.width > browserWidth) {
      this.width = browserWidth;
      // this.setSidebarWidth(this.width);
    }

    document.body.appendChild(this.element);

    this.element.addEventListener('click', function (e: any) {
      if (e.target.className === 'sidebar__overlay') {
        sidebar.close();
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);
    if (changes['openSlideBar'] && changes['openSlideBar'].currentValue) {
      this.open();
    } else {
      console.log('deleteSelected');
      this.close();
    }
  }
  ngOnDestroy() {
    //  this.sidebarService.remove(this.id);
    this.element.remove();
  }
  private resizer(offsetX: number) {
    this.width -= offsetX;
    // this.setSidebarWidth(this.width);
  }
  private setSidebarWidth(width: number) {
    // localStorage.setItem('sidebar_width', width.toString());
  }
  public open(): void {
    this.element.classList.add('sidebar__open');
  }
  public close(): void {
    this.element.classList.remove('sidebar__open');
    this.closeSlideBar.emit(null);
  }

  parseCustomWidth(width: string): number {
    if (width.includes('px')) {
      return parseInt(width.replace('px', ''));
    } else if (width.includes('%')) {
      const percentage = parseInt(width.replace('%', ''));
      return (document.documentElement.offsetWidth * percentage) / 100;
    }
    return 300; // default value
  }
}
