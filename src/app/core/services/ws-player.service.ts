import { Injectable } from '@angular/core';
import { Method } from 'ionicons/dist/types/stencil-public-runtime';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WsPlayerService {
  private webSocket: WebSocket;
  private observer = new Observable<any>();
  url: string = 'ws://192.168.0.178:9090/jsonrpc?kodi';
  private intervalId: any = null;
  payload: any = [
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
  constructor() {
    this.webSocket = new WebSocket(this.url);
    this.webSocket.onopen = () => {
      console.log('Connected');
    };
  }

  getSocket() {
    return new Observable<any>((observer) => {
      this.webSocket.onmessage = (event) => observer.next(this.processMessage(JSON.parse(event.data)) as any);
      this.webSocket.onerror = (event) => observer.error(event);
      this.webSocket.onclose = () => observer.complete();
    });
  }

  askStatus() {
    this.webSocket.send(JSON.stringify(this.payload));
  }

  public run() {
    this.intervalId = setInterval(() => {
      this.askStatus();
    }, 1000);
  }

  stop() {
    console.log('stop');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  processMessage(data: any) {
    if (data.method) {
     // console.log('processMessage', data.method);
    }
    //console.log('processMessage', data[0]);
    return data;
  }

  send(jsonRcpObject: any) {
    this.webSocket.send(
      JSON.stringify(jsonRcpObject)
    );
  }
}
