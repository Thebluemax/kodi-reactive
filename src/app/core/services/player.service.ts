import { HttpClient, JsonpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { payload, PayloadRequest, payloads } from '../payloads/payload';
import { Method } from 'ionicons/dist/types/stencil-public-runtime';
HttpClient;
@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  uriMediaPlayer = 'http://localhost:8008/jsonrpc';
  payload: any[] = [
    {
      jsonrpc: '2.0',
      method: 'Application.GetProperties',
      params: [['volume', 'muted', 'version', 'name']],
      id: 106,
    },
  ];

  playListPayload: any = {
    jsonrpc: '2.0',
    method: 'Playlist.GetItems',
    id: '171',
    params: {
      playlistid: 0,
      properties: [
        'title',
        'thumbnail',
        'file',
        'artist',
        'genre',
        'year',
        'rating',
        'album',
        'track',
        'duration',
        'playcount',
        'dateadded',
        'episode',
        'artistid',
        'albumid',
        'tvshowid',
      ],
      limits: {
        start: 0,
      },
    },
  };

  constructor(private http: HttpClient) {}

  getPlayerStatus() {
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(this.payload))
      .pipe((result) => result);
  }

  setVolume(volume: number) {
    const payload = [
      {
        jsonrpc: '2.0',
        method: 'Application.SetVolume',
        params: {
          volume: volume,
        },
        id: 106,
      },
    ];
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(payload))
      .pipe((result) => result);
  }

  getMainInfo() {
    const payload = [
      {
        jsonrpc: '2.0',
        method: 'Player.GetProperties',
        params: [
          0,
          [
            'playlistid',
            'speed',
            'position',
            'totaltime',
            'time',
            'percentage',
            'shuffled',
            'repeat',
            'canrepeat',
            'canshuffle',
            'canseek',
            'partymode',
          ],
        ],
        id: 67,
      },
      {
        jsonrpc: '2.0',
        method: 'Player.GetItem',
        params: [
          0,
          [
            'title',
            'thumbnail',
            'file',
            'artist',
            'genre',
            'year',
            'rating',
            'album',
            'track',
            'duration',
            'playcount',
            'dateadded',
            'episode',
            'artistid',
            'albumid',
            'tvshowid',
            'fanart',
          ],
        ],
        id: 68,
      },
    ];
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(payload))
      .pipe((result) => result);
  }

  getPlayList() {
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(this.playListPayload))
      .pipe((result) => result);
  }

  getAlbums(
    start: number,
    end: number,
    searchTerm: string = '',
    field: string = 'album',
    operator: string = 'contains'
  ) {
    payloads.album.params.limits.start = start;
    payloads.album.params.limits.end = end;
    if (!searchTerm) searchTerm = '';
    payloads.album.params.filter.field = field;
    payloads.album.params.filter.operator = operator;
    payloads.album.params.filter.value = searchTerm;
    return this.http
      .post<{ result: any }>(
        this.uriMediaPlayer,
        JSON.stringify(payloads.album)
      )
      .pipe((result) => result);
  }

  getAlbum(albumId: number) {
    payloads.albunDetail.params.albumid = albumId;
    console.log('getAlbum payload', payloads.albunDetail);
    return this.http
      .post<{ result: any }>(
        this.uriMediaPlayer,
        JSON.stringify(payloads.albunDetail)
      )
      .pipe((result) => result);
  }

  getTracks(albumId: number) {
    payloads.requestTracks.params.filter.albumid = albumId;
    console.log('getTracks payload', payloads.requestTracks);
    return this.http
      .post<{ result: any }>(
        this.uriMediaPlayer,
        JSON.stringify(payloads.requestTracks)
      )
      .pipe((result) => result);
  }

  getArtists(start: number, end: number, searchTerm: string = '') {
    payloads.artist.params.limits.start = start;
    payloads.artist.params.limits.end = end;
    if (!searchTerm) searchTerm = '';
    payloads.artist.params.filter = {
      field: 'artist',
      operator: 'contains',
      value: searchTerm,
    };

    return this.http
      .post<{ result: { artists: []; limits: any } }>(
        this.uriMediaPlayer,
        JSON.stringify(payloads.artist)
      )
      .pipe((result) => result);
  }

  getArtist(artistId: number) {
    payloads.artistRequestDetail.params.artistid = artistId;
    return this.http.post<any>(
      this.uriMediaPlayer,
      JSON.stringify(payloads.artistRequestDetail)
    );
  }

  getArtistAlbums(artistId: number) {
    const params: JsonRpcRequestParams = {};
    const payload = PayloadRequest.create(Method.AudioLibrary, params);
    return this.http.post<any>(
      this.uriMediaPlayer,
      JSON.stringify(payloads.artistAlbums)
    );
  }
  setToPlayList(item: any, listPosition: number, listActive: number = 0) {
    payloads.sendAlbumToList.params = [listActive, listPosition, item];
    return this.http.post<any>(
      this.uriMediaPlayer,
      JSON.stringify(payloads.sendAlbumToList)
    );
  }

  clearPlaylist() {
    return this.http.post<any>(
      this.uriMediaPlayer,
      JSON.stringify(payloads.clearPlaylist)
    );
  }

  playItem(playlistId: number, position: number) {
    payloads.playItem.params.item = {
      playlistid: playlistId,
      position: position,
    };
    return this.http.post<any>(
      this.uriMediaPlayer,
      JSON.stringify(payloads.playItem)
    );
  }
  setPause(pause: boolean) {
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(payloads.togglePause))
      .pipe((result) => result);
  }

  setShuffle(shuffle: boolean) {
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(payloads.setShuffle))
      .pipe((result) => result);
  }
  setRepeat(repeat: boolean) {
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(payloads.setRepeat))
      .pipe((result) => result);
  }

  setSeek(position: number) {
    payloads.setSeeek[0].params = [0, { percentage: position }];
    return this.http
      .post(this.uriMediaPlayer, JSON.stringify(payloads.setSeeek))
      .pipe((result) => result);
  }

  getGenres() {
    return this.http
      .post<{ result: any }>(
        this.uriMediaPlayer,
        JSON.stringify(payloads.getGenre)
      )
      .pipe((result) => result);
  }
}
