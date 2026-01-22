import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularDelegate, IonicModule, ModalController } from '@ionic/angular';
import { By } from '@angular/platform-browser';
import { AlbumDetailComponent } from './album-detail.component';
import { Album } from 'src/app/core/models/album';
import { Track } from 'src/app/core/models/track';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { AssetsPipe } from 'src/app/core/pipes/assets.pipe';
import { ArrayToStringPipe } from 'src/app/core/pipes/array-to-string.pipe';
import { SecondsToStringPipe } from 'src/app/core/pipes/seconds-to-string.pipe';

const mockAlbum: Album = {
  albumid: 1,
  albumlabel: 'Test Label',
  artist: ['Test Artist', 'Featured Artist'],
  artistid: [1, 2],
  dateadded: '2023-01-01',
  fanart: 'test-fanart.jpg',
  genre: ['Rock', 'Alternative'],
  label: 'Test Album',
  playcount: 0,
  style: ['Rock', 'Alternative'],
  thumbnail: 'test-thumbnail.jpg',
  description: 'This is a test album description',
  year: 2023,
};

const mockTracks: Track[] = [
  {
    album: 'Test Album',
    albumid: 1,
    artist: ['Test Artist'],
    artistid: [1],
    duration: 180,
    file: 'test/file1.mp3',
    label: 'Track 1',
    lastplayed: '2023-01-01',
    songid: 1,
    thumbnail: 'thumb1.jpg',
    title: 'Track 1',
    track: 1,
    year: 2023,
  },
  {
    album: 'Test Album',
    albumid: 1,
    artist: ['Test Artist'],
    artistid: [1],
    duration: 180,
    file: 'test/file2.mp3',
    label: 'Track 1',
    lastplayed: '2023-01-01',
    songid: 2,
    thumbnail: 'thumb2.jpg',
    title: 'Track 1',
    track: 2,
    year: 2023,
  },
  {
    album: 'Test Album',
    albumid: 2,
    artist: ['Test Artist'],
    artistid: [1],
    duration: 240,
    file: 'test/file3.mp3',
    label: 'Track 2',
    lastplayed: '2023-01-01',
    songid: 3,
    thumbnail: 'thumb3.jpg',
    title: 'Track 2',
    track: 3,
    year: 2023,
  },
];

class MockAssetsPipe {
  transform(value: string | undefined, ...args: unknown[]): string {
    // Simple predictable behavior for tests
    if (!value) return '';
    if (args[0] === 'scape') {
      return `mocked-scape-path/${value}`;
    }
    return `mocked-path/${value}`;
  }
}

@Component({
    template: '<body><div><app-album-detail [isModalOpen]="isModalOpen" [album]="album" ></app-album-detail></div>',
    standalone: false
})
class TestHostComponent {
  isModalOpen: boolean = true;
  album: Album | null = null;
  tracks: Track[] = [];
  constructor(private modalController: ModalController) {}

  async openModal() {
    this.album = mockAlbum;
    this.tracks = mockTracks;
    this.isModalOpen = true;

    // Uncomment the following lines to create and present the modal
    /* const modal = await this.modalController.create({
      component: AlbumDetailComponent,
      componentProps: {
        // Any props your modal needs
        tracks: mockTracks,
        album: mockAlbum,
        isModalOpen: true,
      },
    });*/

    return; // await modal.present();
  }
}

describe('AlbumDetailComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let component: AlbumDetailComponent;
  let modalController: ModalController;

  // Mock Pipes
  @Pipe({
    name: 'assets',
    standalone: false
})
  class MockAssetsPipe implements PipeTransform {
    transform(value: string) {
      return `assets/${value}`;
    }
  }
  @Pipe({
    name: 'arrayToString',
    standalone: false
})
  class MockArrayToStringPipe implements PipeTransform {
    transform(value: string[]) {
      return value.join(', ');
    }
  }
  @Pipe({
    name: 'secondsToStr',
    standalone: false
})
  // Mock Pipe for converting seconds to string format
  class MockSecondsToStrPipe implements PipeTransform {
    transform(value: number) {
      return `${Math.floor(value / 60)}:${value % 60 < 10 ? '0' : ''}${
        value % 60
      }`;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AlbumDetailComponent,
        MockAssetsPipe,
        MockArrayToStringPipe,
        MockSecondsToStrPipe,
        TestHostComponent,
      ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AssetsPipe, useClass: MockAssetsPipe },
        ArrayToStringPipe,
        { provide: SecondsToStringPipe, useClass: MockSecondsToStrPipe },
        AngularDelegate,
      ],
    }).compileComponents();
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    modalController = TestBed.inject(ModalController);
    // component = null; // TestBed.inject(AlbumDetailComponent);

    spyOn(modalController, 'create').and.callThrough();
    spyOn(modalController, 'dismiss').and.callThrough();

    hostFixture.detectChanges();
    //fixture = hostFixture;
    //component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should open the modal when button is clicked', async () => {
    // Click the button to open the modal
    hostComponent.isModalOpen = true;

    hostFixture.detectChanges();
    await hostFixture.whenStable();
    // console.log('HostComponent:', hostComponent.);

    // Check that modalController.create was called with the right component
    /* expect(modalController.create).toHaveBeenCalledWith({
      component: AlbumDetailComponent,
      componentProps: {
        tracks: mockTracks,
        album: mockAlbum,
        isModalOpen: true,
      },
    });*/
  });

  /**  describe('hostComponent Properties', () => {
    it('should have default values', () => {
      expect(hostComponent.isModalOpen).toBeTrue();
      expect(hostComponent.album).toBeNull();
      expect(hostComponent.tracks).toEqual([]);
    });

    it('should accept input values', () => {
      hostComponent.album = mockAlbum;
      hostComponent.tracks = mockTracks;
      hostComponent.isModalOpen = false;

      expect(hostComponent.album).toEqual(mockAlbum);
      expect(hostComponent.tracks).toEqual(mockTracks);
      expect(hostComponent.isModalOpen).toBeFalse();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      hostComponent.album = mockAlbum;
      hostComponent.tracks = mockTracks;
      hostComponent.isModalOpen = true;
      hostFixture.detectChanges();
    });

    it('should render album details correctly', () => {
      const albumTitle = hostFixture.debugElement.query(
        By.css('h1.main-title')
      ).nativeElement;
      const albumArtist = hostFixture.debugElement.query(
        By.css('h2.main-subtitle')
      ).nativeElement;
      const albumYear = hostFixture.debugElement.queryAll(
        By.css('.album-col.col-30 span')
      )[0].nativeElement;
      const albumLabel = hostFixture.debugElement.queryAll(
        By.css('.album-col.col-30 span')
      )[1].nativeElement;
      const albumGenre = hostFixture.debugElement.queryAll(
        By.css('.album-col.col-30 span')
      )[2].nativeElement;
      const albumDesc = hostFixture.debugElement.query(
        By.css('.scroll-info p')
      ).nativeElement;

      expect(albumTitle.textContent).toEqual(mockAlbum.label);
      expect(albumArtist.textContent).toContain('Test Artist, Featured Artist');
      expect(albumYear.textContent).toContain(mockAlbum.year);
      expect(albumLabel.textContent).toContain(mockAlbum.albumlabel);
      expect(albumGenre.textContent).toContain('Rock, Alternative');
      expect(albumDesc.textContent).toEqual(mockAlbum.description);
    });

    it('should render track list correctly', () => {
      hostComponent.isModalOpen = true;
      hostFixture.detectChanges();
      console.log('Tracks:', hostFixture);
      const trackItems = hostFixture.debugElement.queryAll(
        By.css('div.tracks>ion-list>ion-item')
      );

      expect(trackItems.length).toBe(mockTracks.length);

      expect(
        trackItems[0].query(By.css('ion-label')).nativeElement.textContent
      ).toContain('Track 1');

      expect(
        trackItems[1].query(By.css('ion-label')).nativeElement.textContent
      ).toContain('Track 2');

      expect(
        trackItems[0].query(By.css('ion-note')).nativeElement.textContent
      ).toContain('3:00');

      expect(
        trackItems[1].query(By.css('ion-note')).nativeElement.textContent
      ).toContain('4:00');
    });

    it('should not render content when album is null', () => {
      hostComponent.album = null;
      hostFixture.detectChanges();

      const albumTitle = hostFixture.debugElement.query(By.css('.main-title'));

      expect(albumTitle).toBeNull();
    });

    it('should handle empty tracks array', () => {
      hostComponent.tracks = [];
      hostFixture.detectChanges();

      const trackItems = hostFixture.debugElement.queryAll(By.css('ion-item'));

      expect(trackItems.length).toBe(0);
    });
  });

  describe('Modal Functionality', () => {
    it('should emit closeDetail when modal willDismiss', () => {
      spyOn(hostComponent.closeDetail, 'emit');
      const event = { detail: { role: 'dismiss' } };
      hostComponent.onWillDismiss(event);

      expect(hostComponent.closeDetail.emit).toHaveBeenCalled();
    });

    it('should emit closeDetail when cancel button is clicked', () => {
      spyOn(hostComponent.closeDetail, 'emit');
      hostComponent.cancel();

      expect(hostComponent.closeDetail.emit).toHaveBeenCalled();
    });

    it('should emit closeDetail when deleteSelected is called', () => {
      spyOn(hostComponent.closeDetail, 'emit');
      hostComponent.deleteSelected();

      expect(hostComponent.closeDetail.emit).toHaveBeenCalled();
    });
  });

  describe('Track Actions', () => {
    beforeEach(() => {
      hostComponent.album = mockAlbum;
      hostComponent.tracks = mockTracks;
      hostComponent.isModalOpen = true;
      hostFixture.detectChanges();
    });

    it('should emit sendToPlaylist when play button is clicked', () => {
      spyOn(hostComponent.sendToPlaylist, 'emit');
      spyOn(console, 'log');

      const playButtons = hostFixture.debugElement.queryAll(
        By.css('ion-item ion-button')
      );

      expect(playButtons.length).toBeGreaterThan(0);

      // Click the play button for the first track
      const firstTrackPlayButton = hostFixture.debugElement
        .queryAll(By.css('ion-item'))[0]
        .queryAll(By.css('ion-button'))[2];
      firstTrackPlayButton.triggerEventHandler('click', null);

      expect(console.log).toHaveBeenCalledWith('sendToPlayList', mockTracks[0]);
      expect(hostComponent.sendToPlaylist.emit).toHaveBeenCalledWith(
        mockTracks[0]
      );
    });

    it('should display correct number of action buttons per track', () => {
      const firstTrackButtons = hostFixture.debugElement
        .queryAll(By.css('ion-item'))[0]
        .queryAll(By.css('ion-button'));

      expect(firstTrackButtons.length).toBe(3); // add, duplicate, play
    });
  });

  describe('Edge Cases', () => {
    it('should handle album with empty artist array', () => {
      const emptyArtistAlbum = { ...mockAlbum, artist: [] };
      hostComponent.album = emptyArtistAlbum;
      hostComponent.isModalOpen = true;
      hostFixture.detectChanges();

      const albumArtist = hostFixture.debugElement.query(
        By.css('h2.main-subtitle')
      ).nativeElement;

      expect(albumArtist.textContent).toBe('');
    });

    it('should handle album with empty genre array', () => {
      const emptyGenreAlbum = { ...mockAlbum, genre: [] };
      hostComponent.album = emptyGenreAlbum;
      hostFixture.detectChanges();

      const albumGenre = hostFixture.debugElement.queryAll(
        By.css('.album-col.col-30 span')
      )[2].nativeElement;

      expect(albumGenre.textContent).toBe('');
    });

    it('should handle albums with very long text descriptions', () => {
      component.isModalOpen = true;
      hostFixture.detectChanges();
      const longDescAlbum = {
        ...mockAlbum,
        description: 'A'.repeat(1000), // Very long description
      };
      component.album = longDescAlbum;
      hostFixture.detectChanges();

      const albumDesc = hostFixture.debugElement.query(
        By.css('.scroll-info p')
      ).nativeElement;

      expect(albumDesc.textContent.length).toBe(1000);
    });

    it('should handle track with 0 duration', () => {
      const zeroLengthTrack: Track[] = [
        {
          album: 'Test Album',
          albumid: 3,
          artist: ['Test Artist'],
          artistid: [1],
          duration: 0,
          file: 'test/file.mp3',
          label: 'Zero Length',
          lastplayed: '2023-01-01',
          songid: 1,
          thumbnail: 'thumb.jpg',
          title: 'Zero Length',
          track: 1,
          year: 2023,
        },
      ];
      component.tracks = zeroLengthTrack;
      hostFixture.detectChanges();
      hostFixture.detectChanges();
      console.log('Tracks:', hostFixture);
      const trackNote = hostFixture.debugElement.query(
        By.css('ion-note')
      ).nativeElement;

      expect(trackNote.textContent).toContain('0:00');
    });
  });

  describe('Logging', () => {
    it('should log correctly in sendToPlayList method', () => {
      spyOn(console, 'log');
      component.sendToPlayList(mockTracks[0]);

      expect(console.log).toHaveBeenCalledWith('sendToPlayList', mockTracks[0]);
    });

    it('should log correctly in onWillDismiss method', () => {
      spyOn(console, 'log');
      const event = { detail: { role: 'dismiss' } };
      component.onWillDismiss(event);

      expect(console.log).toHaveBeenCalledWith('onWillDismiss', event);
    });

    it('should log correctly in cancel method', () => {
      spyOn(console, 'log');
      component.cancel();

      expect(console.log).toHaveBeenCalledWith('cancel');
    });
  });
  */
});
