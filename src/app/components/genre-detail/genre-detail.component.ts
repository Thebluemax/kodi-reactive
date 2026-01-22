import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-genre-detail',
    templateUrl: './genre-detail.component.html',
    styleUrls: ['./genre-detail.component.scss'],
    standalone: false
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
