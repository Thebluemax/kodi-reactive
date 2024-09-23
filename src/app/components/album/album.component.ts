import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/core/services/player.service';
import { Album } from 'src/app/core/models/album';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class AlbumComponent  implements OnInit, OnDestroy {

  albums: Album[] = [];
  start: number = 1;
  end: number = 10;
  limit: number = 20;
  totalAlbums: number = 9999;
  searchTerms: string = '';
  constructor(private playerService: PlayerService) { }
  ngOnDestroy(): void {

    console.log('albums ngOnDestroy');
  }

  ngOnInit() {
    this.end = this.limit;
    this.getAlbums(this.start, this.end);
    console.log('albums ngOnInit');
  }
  getAlbums(start: number, end: number) {
    this.playerService.getAlbums(this.start, this.end, this.searchTerms).subscribe((data: any) => {
      console.log(data);
      this.totalAlbums = data.result.limits.total;
      const albumsReecibed = data.result.albums.map( (item: any) => {
        const album:Album = {...item};
        return album;
      }
      )
      this.albums = [...this.albums, ...albumsReecibed]; 
    })
  }
  onIonInfinite(event: any) {
    console.log('onIonInfinite', event);
    if (this.totalAlbums < this.start) {
      (event as InfiniteScrollCustomEvent).target.disabled = true;
      return;
    }
    this.start = this.end + 1;
    this.end = this.end + this.limit
    this.getAlbums(this.start, this.end);
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  handleSearch(event: any) {
    this.searchTerms = event.detail.value;
    console.log(event.detail, this.searchTerms);
    this.albums = [];
    this.start = 0;
    this.end = this.limit;
    this.getAlbums(this.start, this.end);
  }
}
