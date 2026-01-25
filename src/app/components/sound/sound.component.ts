import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgIf } from '@angular/common';
import { ToggleMuteUseCase } from '@domains/music/player';

@Component({
    selector: 'app-sound',
    templateUrl: './sound.component.html',
    styleUrls: ['./sound.component.scss'],
    imports: [IonicModule, NgIf]
})
export class SoundComponent  implements OnInit {
  private readonly toggleMuteUseCase = inject(ToggleMuteUseCase);

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
    this.toggleMuteUseCase.execute().subscribe();
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
