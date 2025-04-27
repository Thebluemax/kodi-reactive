import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Album } from 'src/app/core/models/album';
import { PlayerService } from 'src/app/core/services/player.service';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
})
export class GenresComponent implements OnInit {
  totalGenres: number = 0;
  genreList: any[] = [];
  selectedGenre: any;
  albums: Album[] = [];
  groupedList: { letter: string; genres: any[] }[] = [];
  @Output() next = new EventEmitter<void>();

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.playerService.getGenres().subscribe((data) => {
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

  goNext() {
    this.next.emit();
  }

  selectGenre(genre: any) {
    this.selectedGenre = genre;
    console.log(genre);
    this.playerService
      .getAlbums(0, 100, genre.title, 'genre', 'is')
      .subscribe((data) => {
        this.albums = data.result.albums;

        console.log(this.albums);
      });
  }

  back() {
    this.selectedGenre = null;
    this.albums = [];
  }
}
