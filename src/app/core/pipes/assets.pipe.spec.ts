import { AssetsPipe } from './assets.pipe';
const kodiLocalUri = 'image://%2fmedia%2fserver%2fMy%20Passport%2fM%c3%basica%2fDavid%20Byrne%2fRei%20Momo%2fcover.jpg/';
const externalAssetUri ='https://assets.fanart.tv/fanart/music/d4659efb-b8eb-4f03-95e9-f69ce35967a9/artistbackground/david-byrne-4e9b43f156e0e.jpg';
const kodiExternalUri = 'image://https%3a%2f%2fassets.fanart.tv%2ffanart%2fmusic%2fd4659efb-b8eb-4f03-95e9-f69ce35967a9%2fartistbackground%2fdavid-byrne-4e9b43f156e0e.jpg/'
const kodiHttpAssetsLocalUri = 'http://192.168.0.178:8080/image/image%3A%2F%2Fmusic%40%252f%252fmedia%252fserver%252fMy%20Passport%252fM%c3%basica%252fDavid%20Byrne%252fRei%20Momo%252fcover.jpg/';

describe('AssetsPipe', () => {
  it('create an instance', () => {
    const pipe = new AssetsPipe();

    expect(pipe).toBeTruthy();
  });

  it('should return a empty string if is undefined', () => {
    const pipe = new AssetsPipe();
    const url = pipe.transform(undefined);

    expect(url).toBe('');
  });

  it('should return the correct local url', () => {
    const pipe = new AssetsPipe();
    const url = pipe.transform(kodiLocalUri);

    expect(url).toBe(kodiHttpAssetsLocalUri);
  });

  it('should return the correct http url for a external asset', () => {
    const pipe = new AssetsPipe();
    const url = pipe.transform(kodiExternalUri);

    expect(url).toBe(externalAssetUri);
  });
});
