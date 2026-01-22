import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SquareItemComponent } from './square-item.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('SquareItemComponent', () => {
  let component: SquareItemComponent;
  let fixture: ComponentFixture<SquareItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SquareItemComponent ],
      imports: [IonicModule.forRoot(), SharedModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SquareItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
