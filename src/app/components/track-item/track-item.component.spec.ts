import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrackItemComponent } from './track-item.component';
import { Track } from 'src/app/core/models/track';
import { ArrayToStringPipe } from 'src/app/core/pipes/array-to-string.pipe';
import { SecondsToStringPipe } from 'src/app/core/pipes/seconds-to-string.pipe';

const mockTrack: Track = {
  albumid: 1,
  title: 'Test Track',
  artistid: [33],
  label: 'Test Album',
  duration: 180,
  file: 'test.mp3',
  album: 'Test Album',
  lastplayed: 'Test Artist',
  thumbnail: 'test.jpg',
  track: 1,
  year: 2023,
  artist: ['Test Artist'],
  songid: 1,
};

describe('TrackItemComponent', () => {
  let component: TrackItemComponent;
  let fixture: ComponentFixture<TrackItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ArrayToStringPipe, SecondsToStringPipe, TrackItemComponent],
}).compileComponents();

    fixture = TestBed.createComponent(TrackItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize track as null', () => {
    expect(component.track).toBeNull();
  });

  it('should emit track when sendToPlayList is called', () => {
    spyOn(component.sendToPlaylist, 'emit');
    component.sendToPlayList(mockTrack);

    expect(component.sendToPlaylist.emit).toHaveBeenCalledWith(mockTrack);
  });

  it('should set track when input is provided', () => {
    component.track = mockTrack;

    expect(component.track).toBe(mockTrack);
  });
});
