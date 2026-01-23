import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { InfiniteScrollCustomEvent, ModalController, IonicModule } from '@ionic/angular';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import { Album } from 'src/app/core/models/album';
import { PlayerService } from 'src/app/core/services/player.service';
import { ArtistDetailComponent } from '../artist-detail/artist-detail.component';
import { NgIf, NgFor } from '@angular/common';
import { TileHoverDirective } from '../../directives/tile-hover.directive';
import { LateralSlideComponent } from '../lateral-slide/lateral-slide.component';
import { AssetsPipe } from '../../core/pipes/assets.pipe';

interface Song {
  albumid: number;
  album: string;
  artist: string[];
  artistid: number[];
  duration: number;
  file: string;
  label: string;
  lastplayed: string;
  songid: number;
  thumbnail: string;
  title: string;
  track: number;
  year: number;
}

interface JsonData {
  result: {
    songs: Song[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

interface AlbumGroup {
  albumid: number;
  albumLabel: string;
  albumThumbnail: string;
  songs: Song[];
}

@Component({
    selector: 'app-artists',
    templateUrl: './artists.component.html',
    styleUrls: ['./artists.component.scss'],
    imports: [NgIf, IonicModule, NgFor, TileHoverDirective, LateralSlideComponent, ArtistDetailComponent, AssetsPipe]
})
export class ArtistsComponent implements OnInit, OnDestroy {
  private playerService = inject(PlayerService);
  private modalCtrl = inject(ModalController);

  artists: any[] = [];
  start: number = 1;
  end: number = 10;
  limit: number = 30;
  totalArtist: number = 9999;
  searchTerms: string = '';
  subcription: Subscription | null = null;
  selectedArtist: any = null;
  albums: AlbumGroup[] = [];
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  isSlideBarOpen: boolean = false;
  @Output() next = new EventEmitter<void>();

  ngOnDestroy(): void {
    if (this.subcription) this.subcription.unsubscribe();
    console.log('ArtistsComponent ngOnDestroy');
  }

  ngOnInit() {
    this.start = 0;
    this.end = this.limit;
    this.getArtists(this.start, this.end);
  }

  getArtists(
    start: number,
    end: number,
    event: InfiniteScrollCustomEvent | null = null
  ) {
    this.subcription = this.playerService
      .getArtists(this.start, this.end, this.searchTerms)
      .subscribe((data) => {
        this.artists = [...this.artists, ...data.result.artists];
        this.totalArtist = data.result.limits.total;
        if (event) event.target.complete();
      });
  }

  onIonInfinite(event: any) {
    this.start = this.end + 1;
    this.end = this.start + this.limit;
    if (this.totalArtist < this.start || this.totalArtist <= this.limit) {
      (event as InfiniteScrollCustomEvent).target.complete();
      return;
    }

    this.getArtists(this.start, this.end, event as InfiniteScrollCustomEvent);
  }

  handleSearch(event: any) {
    this.searchTerms = event.detail.value;
    this.artists = [];
    this.start = 0;
    this.end = this.limit;
    this.getArtists(this.start, this.end);
  }

  getArtist(artist: any) {
    this.isLoading = true;

    const artistData = this.playerService.getArtist(artist.artistid);
    const artistAlbums = this.playerService.getArtistAlbums(artist.artistid);
    const modalData = forkJoin({
      artistData,
      artistAlbums,
    })
      .pipe(
        map(({ artistData, artistAlbums }) => {
          this.selectedArtist = artistData.result.artistdetails;
          this.albums = this.groupSongsByAlbumId(artistAlbums);
        })
      )
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.isSlideBarOpen = true;
        },
        error: (error) => {
          console.error('Error fetching artist data:', error);
        },
      });
    this.subcription = modalData;
  }

  deleteSelected() {
    this.selectedArtist = null;
    this.albums = [];
    this.isSlideBarOpen = false;
  }

  goNext() {
    this.next.emit();
  }
  groupSongsByAlbumId(data: JsonData): AlbumGroup[] {
    // Extract the songs array from the data
    const songs = data.result.songs;

    // Create a temporary object to hold our grouped songs
    const albumGroups: Record<number, AlbumGroup> = {};

    // Iterate through all songs
    songs.forEach((song) => {
      const albumId = song.albumid;
      const albumLabel = song.album;
      const albumThumbnail = song.thumbnail;

      // If this albumId hasn't been seen before, create a new entry for it
      if (!albumGroups[albumId]) {
        albumGroups[albumId] = {
          albumid: albumId,
          albumLabel: albumLabel,
          albumThumbnail: albumThumbnail,
          songs: [],
        };
      }

      // Add the song to its corresponding album group
      albumGroups[albumId].songs.push(song);
    });

    // Convert the object to an array of album objects
    const result = Object.values(albumGroups);

    return result;
  }
  async openModal() {
    const modal = this.modalCtrl.create({
      component: ArtistDetailComponent,
      componentProps: {
        artist: this.selectedArtist,
        albums: this.albums,
      },
      cssClass: 'artist-detail-modal',
    });
    (await modal).present();
  }
}
