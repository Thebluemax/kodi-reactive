import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Album } from 'src/app/core/models/album';
import { Artist } from 'src/app/core/models/artist';
import { GenreService } from 'src/app/core/services/genre.service';
import { IonicModule } from '@ionic/angular';
import { NgFor } from '@angular/common';
import { LateralSlideComponent } from '../lateral-slide/lateral-slide.component';
import { GenreDetailComponent } from '../genre-detail/genre-detail.component';

@Component({
    selector: 'app-genres',
    templateUrl: './genres.component.html',
    styleUrls: ['./genres.component.scss'],
    imports: [IonicModule, NgFor, LateralSlideComponent, GenreDetailComponent]
})
export class GenresComponent implements OnInit {
  totalGenres: number = 0;
  genreList: any[] = [];
  selectedGenre: any;
  albums: Album[] = [];
  artists: Artist[] = [];
  isSlideBarOpen: boolean = false;
  groupedList: { letter: string; genres: any[] }[] = [];

  constructor(private genreService: GenreService) {}

  ngOnInit() {
    this.genreService.getGenres().subscribe((data) => {
      console.log(data, 'data');
      this.genreList = data.result.genres;
      this.totalGenres = data.result.limits.total;
      this.groupedList = this.groupGenresByLetter(this.genreList);
    });
  }

  groupGenresByLetter(genres: any[]): { letter: string; genres: any[] }[] {
    const grouped = genres.reduce((acc: { [key: string]: any[] }, genre) => {
      const firstLetter = genre.label.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(genre);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([letter, genres]) => ({ letter, genres }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  }

  handleSearch(event: any) {
    console.log(event);
  }

  selectGenre(genre: any) {
    this.selectedGenre = genre;
    this.genreService
      .getAlbums(0, 100, genre.title, 'is', 'genre')
      .subscribe((data) => {
        this.albums = data.result.albums;
      });
    this.genreService
      .getArtists(0, 100, genre.label, 'is', 'genre')
      .subscribe((data) => {
        this.artists = data.result.artists;
        //this.isSlideBarOpen = true;
        this.isSlideBarOpen = true;
      });
  }

  back() {
    this.selectedGenre = null;
    this.albums = [];
  }
  deleteSelected() {
    this.selectedGenre = null;
    this.albums = [];
    this.isSlideBarOpen = false;
  }
}
