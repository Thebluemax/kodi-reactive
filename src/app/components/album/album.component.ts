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
    standalone: false
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
  }
  getAlbums(start: number, end: number) {
    this.playerService
      .getAlbums(this.start, this.end, this.searchTerms)
      .subscribe((data: any) => {
        this.totalAlbums = data.result.limits.total;
        const albumsReecibed = data.result.albums.map((item: any) => {
          const album: Album = { ...item };
          return album;
        });
        this.albums = [...this.albums, ...albumsReecibed];
      });
  }
  onIonInfinite(event: any) {
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
    this.albums = [];
    this.start = 0;
    this.end = this.limit;
    this.getAlbums(this.start, this.end);
  }

  getAlbum(album: Album) {
    this.isLoading = true;
    this.playerService.getAlbum(album.albumid).subscribe((data) => {
      this.selectedAlbum = data.result.albumdetails;
      this.getTracks(album);
    });
  }

  deleteSelected() {
    this.isModalOpen = false;
  }

  getTracks(album: Album) {
    this.playerService.getTracks(album.albumid).subscribe((data) => {
      this.tracks = data.result.songs;
      this.totalTracks = data.result.limits.total;
      this.isModalOpen = true;
      this.isLoading = false;
      console.log('getTracks', this.selectedAlbum);
    });
  }

  sendToPlaylist(event: any) {
    this.toPlaylist.emit(event);
  }
}
