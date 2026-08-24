import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy, signal, effect, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { IonRouterOutlet, IonHeader, IonIcon, IonToolbar, IonMenu, IonButton, IonButtons, IonSearchbar, IonContent, IonMenuToggle } from '@ionic/angular/standalone';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CurrentPlayListComponent } from '@domains/music/playlist';
import { CurrentTrackComponent, PlayerControlComponent, SoundComponent } from '@domains/music/player';
import { PlaybackFacade } from '@domains/music/playback/application/playback.facade';
import { GlobalSearchService } from '@shared/services/global-search.service';
import { ThemeService } from '@shared/services/theme.service';
import { KodiSocketService } from '@shared/services/kodi-socket.service';
import { LibraryFacade } from '@domains/library/application/library.facade';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  imports: [
    CurrentPlayListComponent,
    IonRouterOutlet,
    CurrentTrackComponent,
    PlayerControlComponent,
    SoundComponent,
    IonHeader,
    IonIcon,
    IonToolbar,
    IonMenu,
    IonButton,
    IonButtons,
    IonSearchbar,
    IonContent,
    IonMenuToggle,
    AssetsPipe,
  ],
  providers: [AssetsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly destroy$ = new Subject<void>();
  readonly playBackFacade = inject(PlaybackFacade);
  private readonly socket = inject(KodiSocketService);
  private readonly library = inject(LibraryFacade);

  /** Estado de la conexion con Kodi, para poder decirlo en la barra. */
  readonly isKodiConnected = this.socket.isConnected;
  readonly isKodiReconnecting = this.socket.isReconnecting;
  readonly globalSearch = inject(GlobalSearchService);
  readonly themeService = inject(ThemeService);

  readonly isRemoteActive = signal(false);

  private readonly assetsPipe = inject(AssetsPipe);

  readonly controlBgUrl = computed(() => {
    const track = this.playBackFacade.playerInfo();
    const src = track?.fanart || track?.thumbnail || '';
    if (!src) return '';
    return this.assetsPipe.transform(src);
  });

  private readonly titleEffect = effect(() => {
    const track = this.playBackFacade.playerInfo();
    if (track?.title) {
      const artist = track.artist?.length ? ` - ${track.artist.join(', ')}` : '';
      this.titleService.setTitle(`${track.title}${artist}`);
    } else {
      this.titleService.setTitle('Kodi Ready');
    }
  });

  ngOnInit(): void {
    this.playBackFacade.connect();
    // Los eventos de biblioteca escuchan desde el arranque, no solo mientras
    // Ajustes esta a la vista: comparten socket con el reproductor, asi que no
    // cuesta una conexion mas.
    this.library.connect();
    this.playBackFacade.subscribe();

    // Detect initial route
    this.isRemoteActive.set(this.router.url.startsWith('/remote'));

    // Listen for route changes
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(event => {
        this.isRemoteActive.set(event.urlAfterRedirects.startsWith('/remote'));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.playBackFacade.unsubscribe();
    this.library.disconnect();
  }

  navigateTo(section: string): void {
    this.router.navigate([`/${section}`]);
  }

  updateVolume(event: number): void {
    this.playBackFacade.updateVolume(event);
  }

  onPlaylistChanged(): void {
    this.playBackFacade.getPlaylist();
  }

  onSearch(event: CustomEvent): void {
    const value = (event.detail.value as string) || '';
    this.globalSearch.setSearchTerm(value);
  }
}
