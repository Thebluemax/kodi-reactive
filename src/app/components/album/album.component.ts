import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  viewChild,
} from '@angular/core';
import { PlayerService } from 'src/app/core/services/player.service';
import { Album } from 'src/app/core/models/album';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { ItemPlaylist } from 'src/app/core/models/item-playlist';
import { payloads } from 'src/app/core/payloads/payload';
@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class AlbumComponent implements OnInit, OnDestroy {
  albums: Album[] = [];
  tracks: any[] = [];
  totalTracks: number = 0;
  start: number = 0;
  end: number = 10;
  limit: number = 40;
  totalAlbums: number = 9999;
  searchTerms: string = '';
  selectedAlbum: Album | null = null;
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  @Input() playlist: ItemPlaylist[] = [];
  @Input() currentTrackPosition: number | null | undefined = null;
  @Output() next = new EventEmitter<void>();
  @Output() toPlaylist = new EventEmitter<Album | number>();
  constructor(private playerService: PlayerService) {}

  ngOnDestroy() {
    console.log('albums ngOnDestroy');
  }

  ngOnInit() {
    this.end = this.limit;
    this.getAlbums(this.start, this.end);
    console.log('albums ngOnInit');
  }
  getAlbums(start: number, end: number) {
    this.playerService
      .getAlbums(this.start, this.end, this.searchTerms)
      .subscribe((data: any) => {
        console.log(data);
        this.totalAlbums = data.result.limits.total;
        const albumsReecibed = data.result.albums.map((item: any) => {
          const album: Album = { ...item };
          return album;
        });
        this.albums = [...this.albums, ...albumsReecibed];
      });
  }
  onIonInfinite(event: any) {
    console.log('onIonInfinite', event);
    if (this.totalAlbums < this.start) {
      (event as InfiniteScrollCustomEvent).target.disabled = true;
      return;
    }
    this.start = this.end + 1;
    this.end = this.end + this.limit;
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

  getAlbum(album: Album) {
    this.isLoading = true;
    console.log('getAlbum data', album);
    this.playerService.getAlbum(album.albumid).subscribe((data) => {
      console.log('getAlbum', data);
      this.selectedAlbum = data.result.albumdetails;
      this.getTracks(album);
    });
  }

  deleteSelected() {
    this.selectedAlbum = null;
    this.tracks = [];
    this.isModalOpen = false;
  }

  getTracks(album: Album) {
    console.log('getTracks', album);
    this.playerService.getTracks(album.albumid).subscribe((data) => {
      console.log('getTracks', data.result.songs);
      this.tracks = data.result.songs;
      this.totalTracks = data.result.limits.total;
      this.isModalOpen = true;
      this.isLoading = false;
    });
  }

  sendToPlaylist(event: any) {
    console.log('sendToPlaylist from album', event);

    this.toPlaylist.emit(event);
  }

  goNext() {
    this.next.emit();
  }
}
