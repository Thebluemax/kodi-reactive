# Arquitectura DDD en Kodi Reactive

## Cableado de Dominios DDD - Flujo Completo

---

## 1. Configuración Global (`app.config.ts`)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    ...ALBUM_PROVIDERS,    // Dominio Album
    ...TRACK_PROVIDERS     // Dominio Track
  ]
};
```

---

## 2. Providers de cada Dominio

### Album Domain (`album.providers.ts`)

```typescript
export const ALBUM_PROVIDERS: Provider[] = [
  {
    provide: AlbumRepository,           // Interface
    useClass: AlbumKodiRepository       // Implementación concreta
  }
];
```

### Track Domain (`track.providers.ts`)

```typescript
export const TRACK_PROVIDERS: Provider[] = [
  {
    provide: TrackRepository,           // Interface
    useClass: TrackKodiRepository       // Implementación concreta
  }
];
```

---

## 3. Flujo en el Componente de Presentación

### AlbumDetailComponent

```typescript
export class AlbumDetailComponent {
  // Inyección de casos de uso de AMBOS dominios
  private readonly addAlbumToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase); // Album Domain
  private readonly addTrackToPlaylistUseCase = inject(AddTrackToPlaylistUseCase); // Track Domain
  private readonly playTrackUseCase = inject(PlayTrackUseCase);                   // Track Domain

  // UI Actions conectadas a casos de uso
  onAddAlbumToPlaylist(): void {
    this.addAlbumToPlaylistUseCase.execute(albumId, false);
  }

  onAddTrack(track: Track): void {
    this.addTrackToPlaylistUseCase.execute(track.songId, false);
  }

  onPlayTrack(track: Track): void {
    this.playTrackUseCase.execute(track.songId);
  }
}
```

---

## 4. Casos de Uso (Application Layer)

### AddAlbumToPlaylistUseCase

```typescript
export class AddAlbumToPlaylistUseCase {
  private readonly albumRepository = inject(AlbumRepository); // Interface

  execute(albumId: number, playImmediately: boolean): Observable<void> {
    return this.albumRepository.addToPlaylist(albumId, playImmediately);
  }
}
```

### AddTrackToPlaylistUseCase

```typescript
export class AddTrackToPlaylistUseCase {
  private readonly trackRepository = inject(TrackRepository); // Interface

  execute(trackId: number, playImmediately: boolean): Observable<void> {
    return this.trackRepository.addToPlaylist(trackId, playImmediately);
  }
}
```

---

## 5. Repositorios (Domain Layer)

### AlbumRepository Interface

```typescript
export abstract class AlbumRepository {
  abstract addToPlaylist(albumId: number, playImmediately: boolean): Observable<void>;
}
```

### TrackRepository Interface

```typescript
export abstract class TrackRepository {
  abstract addToPlaylist(trackId: number, playImmediately: boolean): Observable<void>;
  abstract playTrack(trackId: number): Observable<void>;
}
```

---

## 6. Implementaciones de Infraestructura

### AlbumKodiRepository

```typescript
export class AlbumKodiRepository extends AlbumRepository {
  addToPlaylist(albumId: number, playImmediately: boolean): Observable<void> {
    // Llama directamente a Kodi API
    return this.http.post(KODI_API_URL, request);
  }
}
```

### TrackKodiRepository

```typescript
export class TrackKodiRepository extends TrackRepository {
  addToPlaylist(trackId: number, playImmediately: boolean): Observable<void> {
    // Llama directamente a Kodi API
    return this.http.post(KODI_API_URL, request);
  }

  playTrack(trackId: number): Observable<void> {
    // Llama directamente a Kodi API
    return this.http.post(KODI_API_URL, request);
  }
}
```

---

## 7. Flujo Completo de Datos

```
UI Click
  ↓
Component (Presentation)
  ↓
Use Case (Application)
  ↓
Repository Interface (Domain)
  ↓
Repository Implementation (Infrastructure)
  ↓
Kodi JSON-RPC API
  ↓
Kodi Media Center
```

---

## 8. Comunicación entre Dominios

Los dominios se comunican a través de interfaces limpias:

- Album Domain conoce tracks solo por `albumId`
- Track Domain opera independientemente
- Presentación puede usar ambos dominios según necesite

```typescript
// En AlbumDetailComponent, podemos usar ambos:
onAddAlbumToPlaylist() // Usa Album Domain
onAddTrack(track)      // Usa Track Domain
onPlayTrack(track)     // Usa Track Domain
```

---

## Beneficios del Cableado

1. Independencia: Cada dominio puede cambiar sin afectar otros
2. Testabilidad: Se pueden mockear interfaces fácilmente
3. Intercambiabilidad: Se puede cambiar infraestructura (Kodi → otro servicio)
4. Escalabilidad: Cada dominio escala independientemente
5. Responsabilidades claras: Cada capa tiene un propósito definido
