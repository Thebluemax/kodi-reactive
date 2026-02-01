# Plan de Trabajo: Seccion Videos

Cada bloque representa una issue independiente y atomica.
Las issues deben ejecutarse en orden ya que existen dependencias entre bloques.

---

## Bloque 0 — Extraer layout principal fuera del dominio Music

**Label:** `enhancement`

El `AppShellComponent` actual (header, player controls, router-outlet principal) vive en `domains/music/playback/presentation/`. Esto acopla el layout global a un dominio concreto. Para que Video pueda existir como seccion independiente, el layout debe ser agnosto de dominio.

**Problema:**

```
app.routes.ts
  └── domains/music/playback/presentation/playback.routes.ts  ← todo cuelga de music
      └── AppShellComponent (header + player + segments + router-outlet)
```

**Solucion:**

```
src/app/
├── layout/
│   ├── app-shell/                    ← Mover aqui el shell actual
│   │   ├── app-shell.component.ts       (header, player controls, router-outlet)
│   │   ├── app-shell.component.html
│   │   └── app-shell.component.scss
│   └── layout.routes.ts             ← Rutas hijas: /music y /video
│
├── domains/
│   ├── music/
│   │   └── playback/presentation/
│   │       ├── music-shell/          ← NUEVO: solo el ion-segment de musica
│   │       └── music.routes.ts          (Albums, Artists, Genres)
│   └── video/
│       └── ...
```

**Tareas:**

- Crear `src/app/layout/` con el componente `AppShellComponent` movido desde `domains/music/playback/presentation/components/app-shell/`
- El shell movido conserva: header (navegacion musica/video, busqueda), player controls (`CurrentTrackComponent`, `PlayerControlComponent`, `SoundComponent`), menu lateral (playlist) y el `router-outlet` principal
- Extraer el `ion-segment` (tabs Albums/Artists/Genres) del shell actual a un nuevo componente `MusicShellComponent` dentro de `domains/music/playback/presentation/` con su propio `router-outlet` hijo
- Crear `layout.routes.ts` que cargue `AppShellComponent` como layout padre con rutas hijas lazy:
  - `/music` → carga `music.routes.ts` (con `MusicShellComponent` + rutas de colecciones)
  - `/video` → placeholder (se implementa en bloques posteriores)
- Actualizar `app.routes.ts` para apuntar a `layout.routes.ts` en vez de `playback.routes.ts`
- Conectar el boton `tv` del header para navegar a `/video`
- Actualizar las rutas de musica de `/collections/albums` a `/music/albums` (y artists, genres)
- Verificar que la seccion de musica sigue funcionando igual que antes

**Criterio de aceptacion:** El layout global ya no pertenece a ningun dominio. La navegacion de musica funciona en `/music/*`. El boton de video navega a `/video` (placeholder). Los player controls siguen operativos.

---

## Bloque 1 — Infraestructura base del dominio Video

**Label:** `feature`

Crear la estructura de carpetas DDD para el dominio de video y registrar los metodos JSON-RPC necesarios en el enum `Methods`.

**Tareas:**

- Crear la estructura de carpetas bajo `src/app/domains/video/` siguiendo el patron existente en `domains/music/`:

  ```
  src/app/domains/video/
  ├── movie/
  │   ├── domain/entities/
  │   ├── domain/repositories/
  │   ├── application/use-cases/
  │   ├── infrastructure/repositories/
  │   └── presentation/components/
  ├── tvshow/
  │   ├── domain/entities/
  │   ├── domain/repositories/
  │   ├── application/use-cases/
  │   ├── infrastructure/repositories/
  │   └── presentation/components/
  ├── actor/
  │   ├── domain/entities/
  │   ├── domain/repositories/
  │   ├── application/use-cases/
  │   ├── infrastructure/repositories/
  │   └── presentation/components/
  ├── genre/
  │   ├── domain/entities/
  │   ├── domain/repositories/
  │   ├── application/use-cases/
  │   ├── infrastructure/repositories/
  │   └── presentation/components/
  └── shared/
      └── components/
  ```

- Agregar al enum `Methods` (`src/app/shared/enums/methods.ts`) los metodos de VideoLibrary de Kodi:
  - `VideoLibrary.GetMovies`
  - `VideoLibrary.GetMovieDetails`
  - `VideoLibrary.GetTVShows`
  - `VideoLibrary.GetTVShowDetails`
  - `VideoLibrary.GetSeasons`
  - `VideoLibrary.GetEpisodes`
  - `VideoLibrary.GetGenres`
- Crear el archivo de rutas `video.routes.ts` con las rutas base (`/video/movies`, `/video/tvshows`, `/video/actors`, `/video/genres`)
- Registrar las rutas de video en `app.routes.ts` con lazy loading

**Criterio de aceptacion:** La estructura existe, las rutas cargan (pueden mostrar componentes placeholder) y los metodos estan disponibles en el enum.

---

## Bloque 2 — Video shell: navegacion interna de la seccion Video

**Label:** `feature`

Crear el componente `VideoShellComponent` con la navegacion por segmentos propia de video.

**Tareas:**

- Crear `VideoShellComponent` en `domains/video/presentation/video-shell/` con su propio `ion-segment` (Peliculas, Series, Actores, Generos) y `router-outlet` hijo
- Crear `video.routes.ts` que cargue `VideoShellComponent` como padre con rutas hijas placeholder (`/video/movies`, `/video/tvshows`, `/video/actors`, `/video/genres`)
- Registrar `video.routes.ts` como ruta lazy en `layout.routes.ts` bajo el path `/video`
- Implementar `segmentChanged` para navegar entre las subsecciones

**Criterio de aceptacion:** Al navegar a `/video` se muestra el shell de video con los 4 segmentos funcionales. Cada subseccion muestra un placeholder visible.

---

## Bloque 3 — Dominio Movie: entidad, repositorio y casos de uso

**Label:** `feature`

Implementar la capa de dominio y aplicacion para peliculas siguiendo el patron DDD establecido.

**Tareas:**

- Crear la entidad `Movie` con su `MovieFactory` (campos: movieId, title, genre, year, rating, runtime, plot, director, cast, thumbnail, fanart, playCount, dateAdded, file)
- Crear la interfaz `MovieRepository` (clase abstracta) con los metodos:
  - `getMovies(params): Observable<MovieListResult>`
  - `getMovieById(movieId): Observable<Movie>`
  - `addToPlaylist(movieId, playImmediately): Observable<void>`
- Crear `MovieKodiRepository` implementando la interfaz con llamadas JSON-RPC (`VideoLibrary.GetMovies`, `VideoLibrary.GetMovieDetails`)
- Crear los use cases: `GetMoviesUseCase`, `GetMovieDetailUseCase`, `AddMovieToPlaylistUseCase`
- Crear `movie.providers.ts` y registrarlo en `app.config.ts`

**Criterio de aceptacion:** Los use cases son inyectables y devuelven datos reales de Kodi. Se verifica con un log en consola o test basico.

---

## Bloque 4 — Presentacion Movie: listado en grid con cards

**Label:** `feature`

Crear el componente de listado de peliculas con scroll infinito y cards reutilizando `MediaTileComponent`.

**Tareas:**

- Crear `MovieListComponent` siguiendo el patron de `AlbumListComponent`:
  - Scroll infinito con paginacion (40 items por pagina)
  - Usar `MediaTileComponent` para renderizar cada pelicula (thumbnail, titulo, anio)
  - Estado reactivo con signals
- Evaluar si `MediaTileComponent` necesita ajustes para soportar contenido de video (textos, acciones). Si es necesario, extenderlo de forma retrocompatible.
- Conectar el componente a la ruta `/video/movies`

**Criterio de aceptacion:** Al navegar a la seccion Peliculas se muestra un grid de peliculas obtenidas desde Kodi con scroll infinito funcional.

---

## Bloque 5 — Presentacion Movie: panel lateral de detalle

**Label:** `feature`

Crear el componente de detalle de pelicula que se muestra en el panel lateral al seleccionar una pelicula.

**Tareas:**

- Crear `MovieDetailComponent` que reutilice `LateralPanelComponent`
- Mostrar la informacion de la pelicula: titulo, poster/fanart, anio, duracion, sinopsis (plot), director, rating
- Incluir una lista de actores (cast) asociados a la pelicula, cada uno clickeable para navegar al detalle del actor
- Incluir boton de reproduccion (play) que invoque `AddMovieToPlaylistUseCase`

**Criterio de aceptacion:** Al hacer clic en una pelicula del grid se abre el panel lateral con toda la informacion y la lista de actores. El boton play inicia la reproduccion.

---

## Bloque 6 — Dominio Actor: entidad, repositorio y casos de uso

**Label:** `feature`

Implementar la capa de dominio y aplicacion para actores/artistas de video.

**Tareas:**

- Investigar la API de Kodi para obtener actores de video. Opciones posibles:
  - `VideoLibrary.GetMovies` con filtro por actor
  - Extraer cast de las respuestas de peliculas
  - Evaluar si existe un endpoint directo para actores
- Crear la entidad `Actor` con su `ActorFactory` (campos: actorId/name, thumbnail, roles, movies asociadas)
- Crear la interfaz `ActorRepository` con los metodos:
  - `getActors(params): Observable<ActorListResult>`
  - `getMoviesByActor(actorName): Observable<Movie[]>`
- Crear `ActorKodiRepository` con la implementacion concreta
- Crear los use cases: `GetActorsUseCase`, `GetMoviesByActorUseCase`
- Crear `actor.providers.ts` y registrarlo en `app.config.ts`

**Criterio de aceptacion:** Se puede obtener una lista de actores y las peliculas asociadas a un actor desde la API de Kodi.

---

## Bloque 7 — Presentacion Actor: listado y panel lateral de detalle

**Label:** `feature`

Crear los componentes de listado y detalle de actores.

**Tareas:**

- Crear `ActorListComponent` con grid de cards (reutilizando `MediaTileComponent`)
  - Scroll infinito con paginacion
  - Mostrar foto del actor y nombre
- Crear `ActorDetailComponent` con panel lateral:
  - Foto y nombre del actor
  - Lista de peliculas en las que participa (obtenidas via `GetMoviesByActorUseCase`)
  - Cada pelicula clickeable para navegar a su detalle
  - Boton de play por pelicula
- Conectar ambos componentes a la ruta `/video/actors`

**Criterio de aceptacion:** Se muestra el grid de actores, al seleccionar uno se abre el panel lateral con su filmografia y se puede reproducir una pelicula desde ahi.

---

## Bloque 8 — Dominio TVShow: entidad, repositorio y casos de uso

**Label:** `feature`

Implementar la capa de dominio y aplicacion para series de television.

**Tareas:**

- Crear las entidades:
  - `TVShow` con `TVShowFactory` (campos: tvshowId, title, genre, year, rating, plot, cast, thumbnail, fanart, seasons, episode count)
  - `Season` con `SeasonFactory` (campos: seasonId, season number, episodes, thumbnail)
  - `Episode` con `EpisodeFactory` (campos: episodeId, title, season, episode number, plot, runtime, file)
- Crear la interfaz `TVShowRepository` con los metodos:
  - `getTVShows(params): Observable<TVShowListResult>`
  - `getTVShowById(tvshowId): Observable<TVShow>`
  - `getSeasons(tvshowId): Observable<Season[]>`
  - `getEpisodes(tvshowId, season): Observable<Episode[]>`
  - `addEpisodeToPlaylist(episodeId, playImmediately): Observable<void>`
- Crear `TVShowKodiRepository` con la implementacion JSON-RPC
- Crear los use cases: `GetTVShowsUseCase`, `GetTVShowDetailUseCase`, `GetSeasonsUseCase`, `GetEpisodesUseCase`, `AddEpisodeToPlaylistUseCase`
- Crear `tvshow.providers.ts` y registrarlo en `app.config.ts`

**Criterio de aceptacion:** Los use cases devuelven datos reales de series, temporadas y episodios desde Kodi.

---

## Bloque 9 — Presentacion TVShow: listado y panel lateral de detalle

**Label:** `feature`

Crear los componentes de listado y detalle de series.

**Tareas:**

- Crear `TVShowListComponent` con grid de cards y scroll infinito
- Crear `TVShowDetailComponent` con panel lateral:
  - Informacion de la serie (titulo, poster, sinopsis, rating, cast)
  - Selector de temporada (dropdown o tabs)
  - Lista de episodios de la temporada seleccionada
  - Boton de play por episodio que invoque `AddEpisodeToPlaylistUseCase`
- Conectar a las rutas `/video/tvshows` y `/video/tvshows/:id`

**Criterio de aceptacion:** Se muestra el grid de series, al seleccionar una se abre el panel lateral con temporadas y episodios. Se puede reproducir un episodio.

---

## Bloque 10 — Dominio Genre (Video): entidad, repositorio, casos de uso y presentacion

**Label:** `feature`

Implementar generos de video (aplicado a peliculas inicialmente).

**Tareas:**

- Crear la entidad `VideoGenre` con su `VideoGenreFactory` (campos: genreId, label, thumbnail)
- Crear la interfaz `VideoGenreRepository` con los metodos:
  - `getGenres(): Observable<VideoGenre[]>`
  - `getMoviesByGenre(genreId): Observable<MovieListResult>`
- Crear `VideoGenreKodiRepository` usando `VideoLibrary.GetGenres` y `VideoLibrary.GetMovies` con filtro por genero
- Crear los use cases: `GetVideoGenresUseCase`, `GetMoviesByGenreUseCase`
- Crear `VideoGenreListComponent` con grid de cards
- Crear `VideoGenreDetailComponent` con panel lateral mostrando la lista de peliculas del genero
- Crear `video-genre.providers.ts` y registrarlo en `app.config.ts`
- Conectar a las rutas `/video/genres` y `/video/genres/:id`

**Criterio de aceptacion:** Se muestran los generos de video, al seleccionar uno se listan las peliculas de ese genero con opcion de play.

---

## Bloque 11 — Integracion de reproduccion de video con el player existente

**Label:** `enhancement`

Asegurar que la reproduccion de video funcione correctamente con el sistema de player y playlist existente.

**Tareas:**

- Verificar que el `PlayerWebSocketAdapter` maneja correctamente eventos de reproduccion de video (el WebSocket ya escucha `Player.OnPlay`, `Player.OnStop`, etc.)
- Asegurar que las llamadas de playlist usen `playlistid: 1` (video) en lugar de `playlistid: 0` (audio) cuando se trate de contenido de video
- Verificar que los controles del player (play/pause, seek, volumen) funcionan con contenido de video
- Ajustar `PlaybackFacade` si es necesario para distinguir entre reproduccion de audio y video
- Adaptar la visualizacion del player en el shell para mostrar informacion relevante de video (titulo de pelicula/episodio en vez de artista/album)

**Criterio de aceptacion:** Se puede iniciar la reproduccion de una pelicula o episodio desde la seccion Video, los controles del player responden correctamente y se muestra la informacion del contenido de video en reproduccion.

---

## Bloque 12 — Componentes compartidos: evaluar y extraer a shared

**Label:** `enhancement`

Evaluar si los componentes compartidos de musica (`MediaTileComponent`, `LateralPanelComponent`) deben moverse a un modulo compartido entre musica y video.

**Tareas:**

- Evaluar el acoplamiento actual de `MediaTileComponent` y `LateralPanelComponent` con el dominio de musica
- Si estan acoplados, refactorizarlos para ser genericos y moverlos a `src/app/shared/components/` o a un nuevo `src/app/domains/shared/`
- Actualizar las importaciones en todos los componentes que los usen (musica y video)
- Verificar que no se rompa ninguna funcionalidad existente

**Criterio de aceptacion:** Los componentes compartidos son reutilizables entre dominios sin acoplamiento a musica. La seccion de musica sigue funcionando igual que antes.

---

## Resumen de ejecucion

| Bloque | Descripcion                          | Label       | Dependencias    |
|--------|--------------------------------------|-------------|-----------------|
| 0      | Extraer layout fuera de Music        | enhancement | —               |
| 1      | Infraestructura base dominio Video   | feature     | 0               |
| 2      | Video shell: navegacion interna      | feature     | 0, 1            |
| 3      | Dominio Movie (DDD)                  | feature     | 1               |
| 4      | Presentacion Movie: listado          | feature     | 2, 3            |
| 5      | Presentacion Movie: detalle          | feature     | 4               |
| 6      | Dominio Actor (DDD)                  | feature     | 1, 3            |
| 7      | Presentacion Actor: listado/detalle  | feature     | 2, 6            |
| 8      | Dominio TVShow (DDD)                 | feature     | 1               |
| 9      | Presentacion TVShow: listado/detalle | feature     | 2, 8            |
| 10     | Genre Video: completo                | feature     | 1, 2, 3         |
| 11     | Integracion reproduccion video       | enhancement | 3, 5, 8, 9      |
| 12     | Extraer componentes a shared         | enhancement | 4, 5, 7, 9, 10  |
