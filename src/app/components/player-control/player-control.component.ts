import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AppInfo } from 'src/app/core/models/app-info';
@Component({
  selector: 'app-player-control',
  templateUrl: './player-control.component.html',
  styleUrls: ['./player-control.component.scss'],
})
export class PlayerControlComponent  implements OnInit, OnChanges {
  isPlaying:boolean = false;
  speed:number = 1;
  @Input() appInfo:AppInfo | null = null;
  
  constructor() {  
   
   }

  ngOnInit() {
    console.log('PlayerControlComponent');
  }
  ngOnChanges(changes: SimpleChanges) {
    changes;
  }

  play() {
    this.isPlaying = !this.isPlaying;
  }
  isPlayerPlaying() {
    const speed = this.appInfo?.speed ?? 0;
   // console.log('isPlayerPlaying', this.isPlaying, speed);
    return this.isPlaying || speed > 0;
  }
}
