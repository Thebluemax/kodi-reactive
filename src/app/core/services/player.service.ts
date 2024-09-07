import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { payloads } from '../payloads/payload';
HttpClient
@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  uriMediaPlayer = 'http://localhost:8008/jsonrpc';
  payload: any[] = [
    {
        "jsonrpc": "2.0",
        "method": "Application.GetProperties",
        "params": [
            [
                "volume",
                "muted",
                "version",
                "name"

            ]
        ],
        "id": 106
    }
] 


playListPayload: any ={
  "jsonrpc": "2.0",
  "method": "Playlist.GetItems",
  "id": "171",
  "params": {
    "playlistid": 0,
    "properties": [
      "title",
      "thumbnail",
      "file",
      "artist",
      "genre",
      "year",
      "rating",
      "album",
      "track",
      "duration",
      "playcount",
      "dateadded",
      "episode",
      "artistid",
      "albumid",
      "tvshowid"
    ],
    "limits": {
      "start": 0
    }
  }
}

  constructor(private http: HttpClient) { }

  getPlayerStatus() {
    return this.http.post(this.uriMediaPlayer, JSON.stringify(this.payload))
    .pipe( result => result);
  }

  setVolume(volume: number) {
    const payload = [
      {
          "jsonrpc": "2.0",
          "method": "Application.SetVolume",
          "params": {
              "volume": volume
          },
          "id": 106
      }
  ] 
    return this.http.post(this.uriMediaPlayer, JSON.stringify(payload))
    .pipe( result => result);
  } 

  getMainInfo() {
    const payload =  [
      {
          "jsonrpc": "2.0",
          "method": "Player.GetProperties",
          "params": [
              0,
              [
                  "playlistid",
                  "speed",
                  "position",
                  "totaltime",
                  "time",
                  "percentage",
                  "shuffled",
                  "repeat",
                  "canrepeat",
                  "canshuffle",
                  "canseek",
                  "partymode"
              ]
          ],
          "id": 67
      },
      {
          "jsonrpc": "2.0",
          "method": "Player.GetItem",
          "params": [
              0,
              [
                  "title",
                  "thumbnail",
                  "file",
                  "artist",
                  "genre",
                  "year",
                  "rating",
                  "album",
                  "track",
                  "duration",
                  "playcount",
                  "dateadded",
                  "episode",
                  "artistid",
                  "albumid",
                  "tvshowid",
                  "fanart"
              ]
          ],
          "id": 68
      }
  ];
    return this.http.post(this.uriMediaPlayer, JSON.stringify(payload))
    .pipe( result => result);
  }

  getPlayList() {
    return this.http.post(this.uriMediaPlayer, JSON.stringify(this.playListPayload))
    .pipe( result => result);
  } 

  getAlbums() {
    return this.http.post(this.uriMediaPlayer, JSON.stringify(payloads.album))
    .pipe( result => result);
  }

  getArtists() {
    return this.http.post(this.uriMediaPlayer, JSON.stringify(payloads.artist))
    .pipe( result => result);
  }
}
