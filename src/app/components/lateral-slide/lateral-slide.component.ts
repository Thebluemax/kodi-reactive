import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { SideBarService } from 'src/app/core/services/side-bar.service';

@Component({
  selector: 'app-lateral-slide',
  templateUrl: './lateral-slide.component.html',
  styleUrls: ['./lateral-slide.component.scss'],
})
export class LateralSlideComponent implements OnInit, OnDestroy, OnChanges {
  public width: number = 300;
  public x = 100;
  public oldX = 0;
  public grabber = false;
  @Input() id: string = '';
  @Input() customWidth: string = '300px';
  @Input() openSlideBar: boolean = false;

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

  constructor(private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    const sidebar = this;
    if (!this.id) {
      console.error('Sidebar must have an ID');
      return;
    }

    this.width = this.parseCustomWidth(this.customWidth);
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
    if (changes['openSlideBar'] && changes['openSlideBar'].currentValue) {
      this.open();
    } else {
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
    this.openSlideBar = false;
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
