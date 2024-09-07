import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayerService } from './player.service';

fdescribe('PlayerService', () => {
  let injector: TestBed;
  let service: PlayerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlayerService],
    });
    injector = getTestBed();

    service = injector.get(PlayerService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });  

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have uriMediaPlayer', () => {
    expect(service.uriMediaPlayer).toBe('http://localhost:8008/jsonrpc');
  });

  it('should getAlbum must have the right payload', () => {
    service.getAlbums();
    const req = httpMock.expectOne(service.uriMediaPlayer);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(service.payload);
  });
});
