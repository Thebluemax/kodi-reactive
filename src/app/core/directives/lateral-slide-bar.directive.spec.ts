import { ElementRef } from '@angular/core';
import { LateralSlideBarDirective } from './lateral-slide-bar.directive';

describe('LateralSlideBarDirective', () => {
  it('should create an instance', () => {
    const elementRef = new ElementRef(document.createElement('div'));
    const directive = new LateralSlideBarDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});
