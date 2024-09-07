import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/core/services/player.service';

@Component({
  selector: 'app-artists',
  templateUrl: './artists.component.html',
  styleUrls: ['./artists.component.scss'],
})
export class ArtistsComponent  implements OnInit, OnDestroy {

  constructor(private playerService: PlayerService) { }
  ngOnDestroy(): void {

    console.log('ArtistsComponent ngOnDestroy');
  }

  ngOnInit() {
    this.playerService.getArtists().subscribe((data) => {
      console.log(data);
    })
    console.log('ArtistsComponent');
  }

}
