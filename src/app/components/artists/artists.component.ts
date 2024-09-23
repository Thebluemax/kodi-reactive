import { Component, OnDestroy, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PlayerService } from 'src/app/core/services/player.service';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.scss'],
})
export class ArtistsComponent  implements OnInit, OnDestroy {
  artists: any[] = [];
  start: number = 1;
  end: number = 10;
  limit: number = 20;
  totalArtist: number = 9999;
  searchTerms: string = '';
  subcription: Subscription | null = null;
  selectedArtist: any = null;
  constructor(private playerService: PlayerService) { }
  ngOnDestroy(): void {
    if (this.subcription) this.subcription.unsubscribe();
    console.log('ArtistsComponent ngOnDestroy');
  }

  ngOnInit() {
    this.start = 0;
    this.end = this.limit;
   this.getArtists(this.start, this.end);
  }

  getArtists(start: number, end: number, event: InfiniteScrollCustomEvent | null = null) {
    console.log('getArtists', start, end,this.searchTerms,event);
    this.subcription = this.playerService.getArtists(this.start, this.end, this.searchTerms).subscribe((data) => {
      this.artists = [...this.artists,...data.result.artists];
      this.totalArtist = data.result.limits.total;
      if (event) event.target.complete();
    })
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
    console.log(event.detail, this.searchTerms);
    this.artists = [];
    this.start = 0;
    this.end = this.limit;
    this.getArtists(this.start, this.end);
  }

  getArtist(artist: any) {
    console.log('getArtist data', artist);
    this.playerService.getArtist(artist.artistid).subscribe((data) => {
      console.log('getArtist', data);
      this.selectedArtist = data.result.artistdetails;
    })
  }

  deleteSelected() {
    this.selectedArtist = null;
  }
}
