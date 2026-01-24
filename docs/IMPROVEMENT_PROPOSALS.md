# Propuestas de Mejora - Kodi Reactive

> Documento generado: 2026-01-24
> Estado: Propuestas identificadas durante revisión de arquitectura DDD

---

## Resumen Ejecutivo

Este documento consolida las propuestas de mejora identificadas durante la revisión de los dominios Album y Track. Las propuestas están organizadas por prioridad y dominio.

---

## 1. Dominio Album

### 1.1 Prioridad Alta

| Propuesta | Descripción | Justificación |
|-----------|-------------|---------------|
| **Shuffle/Aleatorio** | Reproducir álbum en orden aleatorio | Funcionalidad muy común al escuchar música |
| **Navegación a Artista** | Click en artista → ver discografía | Mejora exploración de biblioteca |
| **Ordenación de lista** | Ordenar por: año, artista, fecha añadida, playcount | Flexibilidad para el usuario |

### 1.2 Prioridad Media

| Propuesta | Descripción | Issue |
|-----------|-------------|-------|
| **Filtros avanzados** | Filtrar por género, año, artista | #48 ✅ |
| **Reproducir desde pista** | Iniciar álbum desde pista específica (no solo la pista sola) | - |
| **Duración total** | Mostrar duración total del álbum en tile/detalle | - |
| **Vista alternativa** | Toggle entre Grid y Lista | - |

### 1.3 Prioridad Baja (Futuro)

| Propuesta | Descripción |
|-----------|-------------|
| **Favoritos/Rating** | Marcar álbumes como favoritos |
| **Álbumes recientes** | Sección "Añadidos recientemente" |
| **Álbumes más reproducidos** | Sección basada en playcount |

---

## 2. Dominio Track

### 2.1 Arquitectura

| Propuesta | Descripción | Impacto |
|-----------|-------------|---------|
| **TrackListComponent** | Crear componente standalone reutilizable para listas de tracks | Reutilizable en: búsqueda global, playlist view, artista detail |
| **Mover getAlbumTracks()** | Transferir de `AlbumRepository` a `TrackRepository` | Mejor cohesión semántica |

### 2.2 Repositorio

Métodos sugeridos para `TrackRepository`:

```typescript
abstract class TrackRepository {
  // Existentes
  abstract addToPlaylist(trackId: number, playImmediately: boolean): Observable<void>;
  abstract playTrack(trackId: number): Observable<void>;

  // Propuestos
  abstract getTrackById(trackId: number): Observable<Track>;
  abstract getTracksByAlbum(albumId: number): Observable<Track[]>;
  abstract searchTracks(params: TrackSearchParams): Observable<TrackListResult>;
}
```

### 2.3 Casos de Uso Sugeridos

| Caso de Uso | Descripción |
|-------------|-------------|
| `GetTrackDetailUseCase` | Obtener detalle de un track específico |
| `SearchTracksUseCase` | Búsqueda de tracks con filtros |
| `GetTracksByAlbumUseCase` | Obtener tracks de un álbum (migrado de Album domain) |

---

## 3. Mejoras Generales

### 3.1 UI/UX

| Propuesta | Descripción | Issue |
|-----------|-------------|-------|
| **Toggle tema** | Cambiar entre tema claro/oscuro manualmente | #49 ✅ |
| **Feedback visual** | Toast/snackbar al agregar a playlist | - |
| **Loading states** | Skeletons durante carga de datos | - |

### 3.2 Infraestructura

| Propuesta | Descripción | Prioridad |
|-----------|-------------|-----------|
| **Externalizar config** | Mover URLs hardcodeadas a configuración | Alta |
| **Error handling centralizado** | Interceptor HTTP para manejo de errores | Media |
| **Retry logic** | Reintentos automáticos en fallos de conexión | Media |

### 3.3 Configuración Propuesta

```typescript
// src/app/core/config/kodi.config.ts
export interface KodiConfig {
  apiUrl: string;        // default: 'http://localhost:8008/jsonrpc'
  wsUrl: string;         // default: 'ws://localhost:9090'
  timeout: number;       // default: 5000
  retryAttempts: number; // default: 3
}
```

---

## 4. Componentes Compartidos Sugeridos

### 4.1 Nuevo: TrackListComponent

```
src/app/domains/music/shared/components/track-list/
├── track-list.component.ts
├── track-list.component.html
└── track-list.component.scss
```

**Inputs:**
- `tracks: Track[]`
- `showAlbumInfo: boolean` (para contexto fuera de álbum)
- `showArtistInfo: boolean`

**Outputs:**
- `trackPlay: Track`
- `trackAddToPlaylist: Track`
- `trackSelected: Track`

### 4.2 Nuevo: SearchBarComponent

Componente de búsqueda reutilizable con:
- Debounce integrado
- Filtros contextuales
- Historial de búsquedas recientes

---

## 5. Roadmap Sugerido

### Fase 1: Quick Wins
- [ ] Externalizar configuración de URLs
- [ ] Shuffle en reproducción de álbum
- [ ] Feedback visual (toasts)

### Fase 2: Mejoras de Navegación
- [ ] Navegación Album → Artista
- [ ] TrackListComponent reutilizable
- [ ] Ordenación de lista de álbumes

### Fase 3: Búsqueda y Filtros
- [ ] Implementar filtros avanzados (#48)
- [ ] SearchTracksUseCase
- [ ] Búsqueda global

### Fase 4: Personalización
- [ ] Toggle tema claro/oscuro (#49)
- [ ] Favoritos/Rating
- [ ] Secciones "Recientes" y "Más reproducidos"

---

## 6. Issues Creados

| # | Título | Label | Estado |
|---|--------|-------|--------|
| 48 | Filtros avanzados y mejoras de búsqueda | enhancement | Abierto |
| 49 | Toggle tema claro/oscuro | feature | Abierto |

---

## Notas

- Las prioridades pueden ajustarse según feedback del usuario
- Cada propuesta debe convertirse en issue antes de implementar
- Seguir principios DDD en nuevas implementaciones
