import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgFor } from '@angular/common';
import { AlbumSquareComponent } from '../album-square/album-square.component';
import { SquareItemComponent } from '../square-item/square-item.component';
import { ArrayToStringPipe } from '../../core/pipes/array-to-string.pipe';

@Component({
    selector: 'app-genre-detail',
    templateUrl: './genre-detail.component.html',
    styleUrls: ['./genre-detail.component.scss'],
    imports: [IonicModule, NgFor, AlbumSquareComponent, SquareItemComponent, ArrayToStringPipe]
})
export class GenreDetailComponent {
  @Input() albums: any[] = [];
  @Input() artists: any[] = [];
  @Input() genre: any = null;
  constructor() {}

  cancel() {
    this.genre = null;
  }
}
