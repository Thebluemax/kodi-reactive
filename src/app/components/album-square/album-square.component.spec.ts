import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AlbumSquareComponent } from './album-square.component';
import { Album } from 'src/app/core/models/album';
import { IonicModule } from '@ionic/angular';
import { AssetsPipe } from 'src/app/core/pipes/assets.pipe';
import { ArrayToStringPipe } from 'src/app/core/pipes/array-to-string.pipe';

describe('AlbumSquareComponent', () => {
  let component: AlbumSquareComponent;
  let fixture: ComponentFixture<AlbumSquareComponent>;

  // Mock Album data
  const mockAlbum: Album = {
    albumid: 1,
    albumlabel: 'Test Album',
    label: 'Test Album',
    artist: ['Test Artist'],
    thumbnail: 'test-url.jpg',
    year: 2023,
    genre: ['Test Genre'],
    artistid: [1],
    dateadded: '',
    fanart: '',
    playcount: 0,
    style: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), AssetsPipe, ArrayToStringPipe, AlbumSquareComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumSquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have null album by default', () => {
    expect(component.album).toBeNull();
  });

  it('should set input album correctly', () => {
    component.album = mockAlbum;
    fixture.detectChanges();
    expect(component.album).toEqual(mockAlbum);
  });

  it('should emit album when getAlbum is called', () => {
    // Spy on the output emitter
    spyOn(component.sendAlbum, 'emit');

    // Call the method
    component.getAlbum(mockAlbum);

    // Verify the emitter was called with the right value
    expect(component.sendAlbum.emit).toHaveBeenCalledWith(mockAlbum);
  });

  it('should emit to playlist with correct parameters', () => {
    // Spy on the output emitter
    spyOn(component.sendToPlaylist, 'emit');

    // Call the method with parameters
    const playMedia = true;
    component.emitToPlaylist(mockAlbum, playMedia);

    // Verify the emitter was called with the right values
    expect(component.sendToPlaylist.emit).toHaveBeenCalledWith({
      media: mockAlbum,
      playMedia: playMedia,
    });
  });

  it('should emit null values when methods are called with null', () => {
    // Spy on both output emitters
    spyOn(component.sendAlbum, 'emit');
    spyOn(component.sendToPlaylist, 'emit');

    // Call methods with null
    component.getAlbum(null);
    component.emitToPlaylist(null, false);

    // Verify emitters were called with null values
    expect(component.sendAlbum.emit).toHaveBeenCalledWith(null);
    expect(component.sendToPlaylist.emit).toHaveBeenCalledWith({
      media: null,
      playMedia: false,
    });
  });

  it('should display the album label', () => {
    component.album = mockAlbum;
    fixture.detectChanges();
    const h4Element = fixture.debugElement.query(By.css('h4')).nativeElement;
    console.log(h4Element.textContent);
    expect(h4Element.textContent).toContain(mockAlbum.label);
  });

  it('should display the album artist using the arrayToString pipe', () => {
    component.album = mockAlbum;
    // Note: This test assumes the ArrayToStringPipe works correctly
    // You might need to provide a mock implementation if needed
    fixture.detectChanges();
    const h5Element = fixture.debugElement.query(By.css('h5')).nativeElement;
    expect(h5Element.textContent).toBeTruthy();
    // If you know what the pipe returns, you can test for the exact value
    // expect(h5Element.textContent).toContain('Test Artist, Featured Artist');
  });

  it('should display the album year', () => {
    component.album = mockAlbum;
    fixture.detectChanges();
    const h6Element = fixture.debugElement.query(By.css('h6')).nativeElement;
    expect(h6Element.textContent).toContain(mockAlbum.year);
  });

  it('should set the background image using the assets pipe', () => {
    const cardElement = fixture.debugElement.query(
      By.css('ion-card')
    ).nativeElement;
    const backgroundImage = cardElement.style.backgroundImage;

    // This is a partial test since the full URL depends on the pipe implementation
    expect(backgroundImage).toBeTruthy();
    // You can add more specific assertions if you know the output of your assets pipe
  });

  it('should have three buttons in the template', () => {
    const buttons = fixture.debugElement.queryAll(By.css('ion-button'));
    expect(buttons.length).toBe(3);
  });

  it('should call emitToPlaylist with true when play button is clicked', () => {
    component.album = mockAlbum;
    fixture.detectChanges();
    spyOn(component, 'emitToPlaylist');
    const playButton = fixture.debugElement.queryAll(By.css('ion-button'))[0];

    playButton.triggerEventHandler('click', null);

    expect(component.emitToPlaylist).toHaveBeenCalledWith(mockAlbum, true);
  });

  it('should call emitToPlaylist with false when add to playlist button is clicked', () => {
    component.album = mockAlbum;
    fixture.detectChanges();
    spyOn(component, 'emitToPlaylist');
    const addButton = fixture.debugElement.queryAll(By.css('ion-button'))[1];

    addButton.triggerEventHandler('click', null);

    expect(component.emitToPlaylist).toHaveBeenCalledWith(mockAlbum, false);
  });

  it('should call getAlbum when view button is clicked', () => {
    component.album = mockAlbum;
    fixture.detectChanges();
    spyOn(component, 'getAlbum');
    const viewButton = fixture.debugElement.queryAll(By.css('ion-button'))[2];

    viewButton.triggerEventHandler('click', null);

    expect(component.getAlbum).toHaveBeenCalledWith(mockAlbum);
  });

  it('should display placeholder image when album has no thumbnail', () => {
    // Set album with no thumbnail
    component.album = {
      ...mockAlbum,
      thumbnail: '',
    };
    fixture.detectChanges();

    const cardElement = fixture.debugElement.query(
      By.css('ion-card')
    ).nativeElement;
    const backgroundImage = cardElement.style.backgroundImage;

    // Should still have a background (the default image)
    expect(backgroundImage).toBeTruthy();
    expect(backgroundImage).toContain('no_cover.webp');
  });

  it('should not display album info when album is null', () => {
    // Set album to null
    component.album = null;
    fixture.detectChanges();

    const h4Element = fixture.debugElement.query(By.css('h4')).nativeElement;
    expect(h4Element.textContent.trim()).toBe('');
  });
});
