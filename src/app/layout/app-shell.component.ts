import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonRouterOutlet, IonHeader, IonIcon, IonToolbar, IonMenu, IonButton, IonButtons, IonSearchbar, IonContent, IonMenuToggle } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CurrentPlayListComponent } from '@domains/music/playlist';
import { CurrentTrackComponent, PlayerControlComponent, SoundComponent } from '@domains/music/player';
import { PlaybackFacade } from '@domains/music/playback/application/playback.facade';
import { GlobalSearchService } from '@shared/services/global-search.service';

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
    IonMenuToggle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  readonly playBackFacade = inject(PlaybackFacade);
  readonly globalSearch = inject(GlobalSearchService);

  readonly isRemoteActive = signal(false);

  ngOnInit(): void {
    this.playBackFacade.connect();
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
