import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RangeCustomEvent, IonicModule } from '@ionic/angular';
import { AppInfo } from 'src/app/core/models/app-info';
import { PlayerService } from 'src/app/core/services/player.service';
import { ZeroPaddingPipe } from '../../core/pipes/zero-padding.pipe';
@Component({
    selector: 'app-player-control',
    templateUrl: './player-control.component.html',
    styleUrls: ['./player-control.component.scss'],
    imports: [IonicModule, ZeroPaddingPipe]
})
export class PlayerControlComponent  implements OnInit, OnChanges {
  isPlaying:boolean = false;
  speed:number = 1;
  @Input() appInfo:AppInfo | null = null;
  
  constructor(private playerService: PlayerService) {  
   
   }

  ngOnInit() {
    console.log('PlayerControlComponent');
  }
  ngOnChanges(changes: SimpleChanges) {
    changes;
  }

  play() {
    console.log('play',this.isPlaying);
    this.isPlaying = !this.isPlaying;
    this.playerService.setPause(this.isPlaying)
    .subscribe((data) => {
      console.log(this.isPlaying);
    });
  }
  isPlayerPlaying() {
    const speed = this.appInfo?.speed ?? 0;
   // console.log('isPlayerPlaying', this.isPlaying, speed);
    return this.isPlaying || speed > 0;
  }

  shuffle() {
    this.playerService.setShuffle(true)
    .subscribe((data) => {
      console.log(data);
    });
  }

  repeat() {
    this.playerService.setRepeat(true)
    .subscribe((data) => {
      console.log(data);
    });
  }

  seekChange(event: any) {
    let rangeEvent: RangeCustomEvent = (event as RangeCustomEvent)
    let value: number = rangeEvent.detail.value as number;
    console.log('seekChange', value);
    this.playerService.setSeek(value)
    .subscribe((data) => {
      console.log(data);
    });
  }
}
