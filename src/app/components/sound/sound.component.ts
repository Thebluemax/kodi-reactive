import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-sound',
    templateUrl: './sound.component.html',
    styleUrls: ['./sound.component.scss'],
    standalone: false
})
export class SoundComponent  implements OnInit {

  constructor() { }
  @Input() isMute:boolean = false;
  @Input() volume:number = 0;

  @Output() updateVolume: EventEmitter<number> = new EventEmitter<number>();
  isOpen:boolean = false;
  volumeIconHigh = 'volume-high';
  volumeIconLow = 'volume-low';
  volumeIconOff = 'volume-off';
  volumeIconMute = 'volume-mute-outline';

  ngOnInit() {
    console.log('SoundComponent', this.volume, this.isMute);
  }

  setVolume(event:any) {
    console.log('updateVolume', event.detail.value);
    this.updateVolume.emit(event.detail.value);
  }

  openVolume() {
    this.isOpen = !this.isOpen;
  }

  muteVolume() {
    this.isMute = !this.isMute;

    console.log('updateVolume', this.isMute);
   // this.updateVolume.emit(this.isMute ? 0 : this.volume);
  }

  calculateVolumeIcon() {
    if (this.isMute) {
      return this.volumeIconMute;
    } else
    if (this.volume === 0) {
      return this.volumeIconOff;
    } else if (this.volume < 50) {
      return this.volumeIconLow;
    } else {
      return this.volumeIconHigh;
    }

  }
}
