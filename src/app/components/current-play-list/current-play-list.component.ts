import { Component, Input, OnInit } from '@angular/core';
import { ItemPlaylist } from 'src/app/core/models/item-playlist';

@Component({
  selector: 'app-current-play-list',
  templateUrl: './current-play-list.component.html',
  styleUrls: ['./current-play-list.component.scss'],
})
export class CurrentPlayListComponent {
  @Input() playlist: ItemPlaylist[] = [];
  @Input() currentTrackPosition:number | null | undefined = null;
  constructor() { }
}
