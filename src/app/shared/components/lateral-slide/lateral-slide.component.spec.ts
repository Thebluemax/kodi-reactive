import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LateralSlideComponent } from './lateral-slide.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LateralSlideComponent', () => {
  let component: LateralSlideComponent;
  let fixture: ComponentFixture<LateralSlideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LateralSlideComponent],
      providers: [
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LateralSlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
