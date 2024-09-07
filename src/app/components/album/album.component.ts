import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/core/services/player.service';
import { Album } from 'src/app/core/models/album';
@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class AlbumComponent  implements OnInit, OnDestroy {

  albums: Album[] = [];
  constructor(private playerService: PlayerService) { }
  ngOnDestroy(): void {

    console.log('albums ngOnDestroy');
  }

  ngOnInit() {
    this.playerService.getAlbums().subscribe((data: any) => {
      console.log(data.result.albums);
      this.albums = data.result.albums.map( (item: any) => {
        const album:Album = {...item};
        return album;
      }
      )
    })
    console.log('albums ngOnInit');
  }

}
