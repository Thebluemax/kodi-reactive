import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTileHover]',
  standalone: true,
})
export class TileHoverDirective {
  constructor(private renderer: Renderer2, private el: ElementRef) {}

  @HostListener('mouseover', ['$event.target']) overElement(target: any) {
    // Assuming you want to add 'highlighted' class to 'ion-card-header' on mouseover
    // const cardHeader = this.el.nativeElement.querySelector('ion-card-header');
    const cardContent = this.el.nativeElement.querySelector('ion-card-content');
    /* if (cardHeader) {
      this.renderer.setStyle(cardHeader, 'opacity', '1');
    }*/
    if (cardContent) {
      this.renderer.setStyle(cardContent, 'opacity', '1');
    }
  }

  @HostListener('mouseout', ['$event.target']) outElement(target: any) {
    // Assuming you want to remove 'highlighted' class from 'ion-card-header' on mouseout
    // const cardHeader = this.el.nativeElement.querySelector('ion-card-header');
    /* if (cardHeader) {
      this.renderer.setStyle(cardHeader, 'opacity', '0');
    }*/
    const cardContent = this.el.nativeElement.querySelector('ion-card-content');
    if (cardContent) {
      this.renderer.setStyle(cardContent, 'opacity', '0');
    }
  }
}
