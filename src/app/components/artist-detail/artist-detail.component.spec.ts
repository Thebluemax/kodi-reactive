import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ArtistDetailComponent } from './artist-detail.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('ArtistDetailComponent', () => {
  let component: ArtistDetailComponent;
  let fixture: ComponentFixture<ArtistDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SharedModule, ArtistDetailComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ArtistDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
