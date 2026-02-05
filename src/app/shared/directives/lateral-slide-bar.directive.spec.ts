import { Component, ChangeDetectionStrategy } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LateralSlideBarDirective } from './lateral-slide-bar.directive';

@Component({
    template: '<div appLateralSlideBar></div>',
    imports: [LateralSlideBarDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {}

describe('LateralSlideBarDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
  });

  it('should create an instance', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const directiveEl = fixture.debugElement.children[0];
    const directive = directiveEl.injector.get(LateralSlideBarDirective);

    expect(directive).toBeTruthy();
  });
});
