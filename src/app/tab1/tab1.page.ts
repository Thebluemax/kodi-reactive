import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService } from '../core/services/player.service';
import { AppInfo, CurrentTrack } from '../core/models/app-info';
import { WsPlayerService } from '../core/services/ws-player.service';
import { ItemPlaylist } from '../core/models/item-playlist';
import { Methods } from '../core/enums/methods';
import { payloads } from '../core/payloads/payload';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  volume: number = 0;
  isMute: boolean = false;
  title: string = 'Volume Control';
  playlist: ItemPlaylist[] = [];
  pages: string[] = ['album', 'artist'];
  appInfo: AppInfo | null = null;
  playerInfo: CurrentTrack | null = null;
  showComponent:boolean = false;
  activeComponent:string = '';
  constructor(
    private plService: PlayerService,
    private wsService: WsPlayerService,
    private ref: ChangeDetectorRef,
  ) {}
  ionViewDidEnter(): void {
    console.log('ionViewDidEnter');
    this.wsService.run();

  }
  ionViewDidLeave(): void {
    console.log('ngOnDestroy');

    this.wsService.stop();
  }

  ngOnInit(): void {
    this.plService.getPlayerStatus().subscribe((data) => {
      const _data = data as any[];
      this.volume = _data[0].result.volume;
      this.isMute = _data[0].result.muted;
      this.title = `${_data[0].result.name} ${_data[0].result.version.major}.${_data[0].result.version.minor}.${_data[0].result.version.minor}`;
    });
    
    //this.getMainInfo();
    
    this.wsService.getSocket().subscribe((data) => {
      if (data.method) {
        this.proceesMethod(data);
        //console.log('GET sOCKET method',data.method);
      } else if (Array.isArray(data)) {
        this.appInfo = { ...data[0].result };
        this.playerInfo = { ...data[1].result.item };
        this.ref.markForCheck();
        //console.log('GET sOCKET array',data.length);
      } else {
        console.log('GET sOCKET .id',data);
      }
     // this.wsService.send(payloads.appInfo);
      
    });
    // this.wsService.run();
    this.getPlaylists();
  }
  
  updateVolume(event: any) {
    this.volume = event;
    const payload: any = payloads.volume
    payload.params.volume = this.volume;
    this.wsService.send(payload);
    // this.getMainInfo();
  }
  
  getMainInfo() {
    this.plService.getMainInfo().subscribe((data) => {
      const data_ = data as any[];
      this.appInfo = { ...data_[0].result };
      this.playerInfo = { ...data_[1].result.item };
      console.log(this.appInfo, this.playerInfo);
      
      //this.isMute = appInfo.muted;
    });
  }

  getPlaylists() {
    this.plService.getPlayList().subscribe((data: any) => {
     // console.log(data);
      this.playlist = data.result.items.map((item: any) => {
        return item as ItemPlaylist;
      });
    });
  }

  proceesMethod(data: any) {
    console.log('proceesMethod', data.method);
    switch (data.method) {
      case Methods.PlaylistOnAdd:
        this.getPlaylists();
        break;
    
      default:
        break;
    } 
  }

  processById(data: any) {
    switch (data.id) {

    }
  }

  change() {
    let position = this.pages.indexOf(this.activeComponent);
    if (position < this.pages.length - 1) {
      this.activeComponent = this.pages[position + 1];
    } else {
      this.activeComponent = this.pages[0];
    }
  }
}
