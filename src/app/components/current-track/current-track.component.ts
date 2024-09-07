import { Component, Input, OnInit } from '@angular/core';
import { CurrentTrack } from 'src/app/core/models/app-info';

@Component({
  selector: 'player-current-track',
  templateUrl: './current-track.component.html',
  styleUrls: ['./current-track.component.scss'],
})
export class CurrentTrackComponent  {
  @Input() currentTrack: CurrentTrack | null = null ;
  constructor() { }

  transform(value: string | undefined): any {
    if(!value) return '';
    const isHttp = value.includes('http');
    value = value.replace(/image:\/\//g, '');
    if(isHttp) {
      value = value.replace(/%3a/g, ':');
      value = value.replace(/%2f/g, '/');
      value = value.substring(0, value.length - 1);
    } else {
      value = value.replace(/music@%2f/g, '');      
      value = value.replace(/%3a/g, '%3A');
      value = value.replace(/%2f/g, '%252f');
    }
    const base = 'http://192.168.0.178:8080/image/image%3A%2F%2Fmusic%40%252f';
    return `${isHttp ? '' : base}${value}`;
}

printArtist() {
  if(!this.currentTrack?.artist) return '';
  return this.currentTrack?.artist.join(', ');
}
}
