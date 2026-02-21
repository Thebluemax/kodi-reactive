import { TestBed } from '@angular/core/testing';
import { AssetsPipe } from './assets.pipe';
import { KodiConfigService } from '@shared/services/kodi-config.service';

const BASE_URL = 'http://192.168.0.178:8080';

describe('AssetsPipe', () => {
  let pipe: AssetsPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AssetsPipe,
        { provide: KodiConfigService, useValue: { httpBaseUrl: BASE_URL } },
      ],
    });
    pipe = TestBed.inject(AssetsPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return http url as-is', () => {
    const url = 'http://192.168.0.178:8080/image/cover.jpg';
    expect(pipe.transform(url)).toBe(url);
  });

  it('should strip trailing slash from http url', () => {
    expect(pipe.transform('http://192.168.0.178:8080/image/cover.jpg/')).toBe(
      'http://192.168.0.178:8080/image/cover.jpg'
    );
  });

  it('should encode kodi image:// url (local path)', () => {
    const input = 'image://%2fmedia%2fserver%2fMy%20Passport%2fM%c3%basica%2fDavid%20Byrne%2fRei%20Momo%2fcover.jpg/';
    const expected = `${BASE_URL}/image/image%3A%2F%2F%252fmedia%252fserver%252fMy%2520Passport%252fM%25c3%25basica%252fDavid%2520Byrne%252fRei%2520Momo%252fcover.jpg%2F`;
    expect(pipe.transform(input)).toBe(expected);
  });

  it('should encode kodi image:// url with music@ prefix', () => {
    const input = 'image://music@%2fmedia%2fserver%2fMy%20Passport%2fM%c3%basica%2fJhon%20Legend%2fStudio%20Albums%2fEvolver%2f1.%20Good%20Morning%20(intro).mp3/';
    const expected = `${BASE_URL}/image/image%3A%2F%2Fmusic%40%252fmedia%252fserver%252fMy%2520Passport%252fM%25c3%25basica%252fJhon%2520Legend%252fStudio%2520Albums%252fEvolver%252f1.%2520Good%2520Morning%2520(intro).mp3%2F`;
    expect(pipe.transform(input)).toBe(expected);
  });

  it('should encode kodi image:// url with parentheses in path', () => {
    const input = 'image://%2fmedia%2fserver%2fMy%20Passport%2fM%c3%basica%2fDe-Phazz%2fCompilations%2f2012%20The%20Uppercut%20Collection%20(CD)%2fCD7%20De-Phazz%20Naive%20(Acoustic%20Versions)%2fcover.jpg/';
    const expected = `${BASE_URL}/image/image%3A%2F%2F%252fmedia%252fserver%252fMy%2520Passport%252fM%25c3%25basica%252fDe-Phazz%252fCompilations%252f2012%2520The%2520Uppercut%2520Collection%2520(CD)%252fCD7%2520De-Phazz%2520Naive%2520(Acoustic%2520Versions)%252fcover.jpg%2F`;
    expect(pipe.transform(input)).toBe(expected);
  });

  it('should proxy kodi-wrapped external url through kodi image api', () => {
    const input = 'image://https%3a%2f%2fassets.fanart.tv%2ffanart%2fmusic%2fd4659efb-b8eb-4f03-95e9-f69ce35967a9%2fartistbackground%2fdavid-byrne-4e9b43f156e0e.jpg/';
    const expected = `${BASE_URL}/image/image%3A%2F%2Fhttps%253a%252f%252fassets.fanart.tv%252ffanart%252fmusic%252fd4659efb-b8eb-4f03-95e9-f69ce35967a9%252fartistbackground%252fdavid-byrne-4e9b43f156e0e.jpg%2F`;
    expect(pipe.transform(input)).toBe(expected);
  });
});
