import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GenreDetailComponent } from './genre-detail.component';

describe('GenreDetailComponent', () => {
  let component: GenreDetailComponent;
  let fixture: ComponentFixture<GenreDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), GenreDetailComponent]
}).compileComponents();

    fixture = TestBed.createComponent(GenreDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
