import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PayloadRequest } from '../payloads/payload';
import { Methods } from '../enums/methods';
import { JsonRpcRequestParams } from '../models/jsonrpcRequest';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private http = inject(HttpClient);

  uriMediaPlayer = 'http://localhost:3000/mediaplayer';
  constructor() {
    this.uriMediaPlayer = `${environment.serverApiUrl}:${environment.apiPort}/jsonrpc`;
  }
  getGenres() {
    const params = {
      properties: PayloadRequest.GenreProperties,
      sort: {
        method: 'title',
        order: 'ascending',
        ignorearticle: true,
      },
    };
    const payloads = PayloadRequest.create(
      Methods.AudioLibraryGetGenres,
      params
    );
    return this.http
      .post<{ result: any }>(this.uriMediaPlayer, payloads.toJson())
      .pipe((result) => result);
  }
  getAlbums(
    start: number,
    end: number,
    genre: string,
    operator: string,
    field: string
  ) {
    const params = {
      properties: PayloadRequest.albumProperties,
      limits: {
        start: start,
        end: end,
      },
      filter: {
        field: field,
        operator: operator,
        value: genre,
      },
    };
    const payloads = PayloadRequest.create(
      Methods.AudioLibraryGetAlbums,
      params
    );
    return this.http
      .post<{ result: any }>(this.uriMediaPlayer, payloads.toJson())
      .pipe((result) => result);
  }

  getArtists(
    start: number,
    end: number,
    genre: string,
    operator: string,
    field: string
  ) {
    const params = {
      properties: PayloadRequest.artistProperties,
      limits: {
        start: start,
        end: end,
      },
      filter: {
        field: field,
        operator: operator,
        value: genre,
      },
    };
    const payloads = PayloadRequest.create(
      Methods.AudioLibraryGetArtists,
      params
    );
    return this.http
      .post<{ result: any }>(this.uriMediaPlayer, payloads.toJson())
      .pipe((result) => result);
  }
}
