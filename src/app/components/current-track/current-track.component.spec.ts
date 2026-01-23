import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CurrentTrackComponent } from './current-track.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('CurrentTrackComponent', () => {
  let component: CurrentTrackComponent;
  let fixture: ComponentFixture<CurrentTrackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SharedModule, CurrentTrackComponent]
}).compileComponents();

    fixture = TestBed.createComponent(CurrentTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
