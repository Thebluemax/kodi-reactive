// ==========================================================================
// APPLICATION - Media Import Facade
// ==========================================================================
// Orquesta el flujo: parsear, emparejar contra la biblioteca, previsualizar y
// —solo tras confirmacion— aplicar.
//
// Nada se escribe hasta que se llama a `apply`.
// ==========================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, concat, of } from 'rxjs';
import { catchError, map, toArray } from 'rxjs/operators';

import { MediaImportKodiRepository } from '../infrastructure/repositories/media-import-kodi.repository';
import { parseImportJson } from '../domain/services/media-import-parser';
import { parseImportXml } from '../domain/services/media-import-xml-parser';
import { buildPlan } from '../domain/services/media-import-matcher';
import {
  MediaImportIssue,
  MediaImportMatch,
  MediaImportPlan,
  MediaKind
} from '../domain/entities/media-import.entity';
import { UpdateMovieUseCase } from '@domains/video/movie/application/use-cases/update-movie.use-case';
import { UpdateTVShowUseCase } from '@domains/video/tvshow/application/use-cases/update-tvshow.use-case';
import { UpdateAlbumUseCase } from '@domains/music/album/application/use-cases/update-album.use-case';
import { UpdateArtistUseCase } from '@domains/music/artist/application/use-cases/update-artist.use-case';
import { UpdateTrackUseCase } from '@domains/music/track/application/use-cases/update-track.use-case';

export interface AppliedResult {
  readonly match: MediaImportMatch;
  readonly error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaImportFacade {
  private readonly repository = inject(MediaImportKodiRepository);
  private readonly updateMovie = inject(UpdateMovieUseCase);
  private readonly updateTVShow = inject(UpdateTVShowUseCase);
  private readonly updateAlbum = inject(UpdateAlbumUseCase);
  private readonly updateArtist = inject(UpdateArtistUseCase);
  private readonly updateTrack = inject(UpdateTrackUseCase);

  readonly issues = signal<MediaImportIssue[]>([]);
  readonly plan = signal<MediaImportPlan | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly results = signal<AppliedResult[]>([]);

  readonly hasPlan = computed(() => this.plan() !== null);
  readonly changedCount = computed(() => this.plan()?.changed.length ?? 0);
  readonly failedCount = computed(
    () => this.results().filter(result => result.error).length
  );

  reset(): void {
    this.issues.set([]);
    this.plan.set(null);
    this.results.set([]);
  }

  /**
   * Parsea y empareja. No escribe nada.
   *
   * El formato se deduce del contenido y no de la extension: un NFO puede
   * llamarse .nfo o .xml, y un archivo mal nombrado no deberia fallar con un
   * mensaje sobre JSON.
   */
  preview(text: string): Observable<void> {
    this.reset();
    this.isLoading.set(true);

    const parsed = looksLikeXml(text) ? parseImportXml(text) : parseImportJson(text);
    this.issues.set(parsed.issues);

    if (parsed.entries.length === 0) {
      this.isLoading.set(false);
      return of(void 0);
    }

    const kinds = parsed.entries.map(entry => entry.kind);

    return this.repository.loadIndex(kinds).pipe(
      map(index => {
        this.plan.set(buildPlan(parsed.entries, index));
        this.isLoading.set(false);
      }),
      catchError((error: Error) => {
        this.isLoading.set(false);
        this.issues.update(issues => [...issues, { index: -1, message: error.message }]);
        return of(void 0);
      })
    );
  }

  /**
   * Aplica solo lo que cambia. Las peticiones van en serie: un import puede ser
   * de cientos de elementos y lanzarlas a la vez ahogaria a Kodi.
   */
  apply(): Observable<AppliedResult[]> {
    const changed = this.plan()?.changed ?? [];

    if (changed.length === 0) {
      return of([]);
    }

    this.isLoading.set(true);
    this.results.set([]);

    return concat(...changed.map(match => this.applyOne(match))).pipe(
      toArray(),
      map(results => {
        this.results.set(results);
        this.isLoading.set(false);
        return results;
      })
    );
  }

  private applyOne(match: MediaImportMatch): Observable<AppliedResult> {
    const patch: Record<string, unknown> = {};

    for (const change of match.changes) {
      patch[change.field] = change.after;
    }

    return this.updateFor(match.entry.kind, match.item.id, patch).pipe(
      map(() => ({ match })),
      // Un fallo suelto no puede tumbar el resto del lote.
      catchError((error: Error) => of({ match, error: error.message }))
    );
  }

  private updateFor(
    kind: MediaKind,
    id: number,
    patch: Record<string, unknown>
  ): Observable<void> {
    switch (kind) {
      case MediaKind.Movie:
        return this.updateMovie.execute(id, patch);
      case MediaKind.TVShow:
        return this.updateTVShow.execute(id, patch);
      case MediaKind.Album:
        return this.updateAlbum.execute(id, patch);
      case MediaKind.Artist:
        return this.updateArtist.execute(id, patch);
      case MediaKind.Song:
        return this.updateTrack.execute(id, patch);
    }
  }
}

/** Primer caracter significativo: `<` es XML, cualquier otra cosa se lee como JSON. */
function looksLikeXml(text: string): boolean {
  return /^\s*</.test(text);
}
