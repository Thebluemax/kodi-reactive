import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ArtistsComponent } from './artists.component';

describe('ArtistsComponent', () => {
  let component: ArtistsComponent;
  let fixture: ComponentFixture<ArtistsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtistsComponent ],
      imports: [IonicModule.forRoot()],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
