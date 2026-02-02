# Plan: Extraer MediaTile y LateralPanel a @shared

## Diagnostico

- **TypeScript**: Ambos componentes son 100% genericos (tipos `unknown`, cero imports de musica)
- **SCSS**: Ambos importan `@use '../../styles' as *` de `domains/music/shared/styles/`
- **Ubicacion actual**: `@domains/music/shared/` — usado por 5 dominios (album, movie, actor, tvshow, genre)
- **Conclusion**: Solo mover de carpeta + reubicar SCSS styles. No hay refactor de TypeScript.

---

## Estructura destino

```# Plan: Extraer MediaTile y LateralPanel a @shared

## Diagnostico

- **TypeScript**: Ambos componentes son 100% genericos (tipos `unknown`, cero imports de musica)
- **SCSS**: Ambos importan `@use '../../styles' as *` de `domains/music/shared/styles/`
- **Ubicacion actual**: `@domains/music/shared/` — usado por 5 dominios (album, movie, actor, tvshow, genre)
- **Conclusion**: Solo mover de carpeta + reubicar SCSS styles. No hay refactor de TypeScript.

---

## Estructura destino

```

src/app/shared/
├── components/
│   ├── media-tile/          (mover desde music/shared)
│   │   ├── media-tile.component.ts
│   │   ├── media-tile.component.html
│   │   └── media-tile.component.scss
│   ├── lateral-panel/       (mover desde music/shared)
│   │   ├── lateral-panel.component.ts
│   │   ├── lateral-panel.component.html
│   │   └── lateral-panel.component.scss
│   ├── index.ts             (NUEVO: barrel export)
│   ├── app-shell/           (existente)
│   ├── lateral-slide/       (existente)
│   └── square-item/         (existente)
├── styles/                  (mover desde music/shared)
│   ├── _index.scss
│   ├──_settings.scss
│   └── _tools.scss
├── directives/              (existente, ya tiene tile-hover)
├── pipes/                   (existente)
└── services/                (existente)

```

---

## Pasos

### 1. Mover `styles/` (3 archivos)
- `domains/music/shared/styles/_index.scss` → `shared/styles/_index.scss`
- `domains/music/shared/styles/_settings.scss` → `shared/styles/_settings.scss`
- `domains/music/shared/styles/_tools.scss` → `shared/styles/_tools.scss`

### 2. Mover `media-tile/` (3 archivos)
- Mover los 3 archivos a `shared/components/media-tile/`
- Actualizar `@use` en SCSS: `@use '../../styles' as *` (sigue valido con la nueva estructura)

### 3. Mover `lateral-panel/` (3 archivos)
- Mover los 3 archivos a `shared/components/lateral-panel/`
- Actualizar `@use` en SCSS: `@use '../../styles' as *` (sigue valido)

### 4. Crear barrel `shared/components/index.ts`
```typescript
export { MediaTileComponent, MediaTileAction } from './media-tile/media-tile.component';
export { LateralPanelComponent } from './lateral-panel/lateral-panel.component';
```

### 5. Actualizar 5 imports

| Archivo | Cambio |
|---------|--------|
| `domains/music/album/.../album-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/movie/.../movie-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/actor/.../actor-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/tvshow/.../tvshow-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/genre/.../video-genre-list.component.ts` | `@domains/music/shared` → `@shared/components` |

### 6. Limpiar `domains/music/shared/`

- Eliminar `styles/` (movido)
- Eliminar `components/media-tile/` y `components/lateral-panel/` (movidos)
- Actualizar `index.ts`: quitar exports de MediaTile y LateralPanel (queda vacio → eliminar archivo si no queda nada)

### 7. tsconfig.json

- `@shared/*` ya mapea a `src/app/shared/*` — **sin cambios necesarios**

---

## Verificacion

- [ ] `ng serve` compila sin errores
- [ ] Tab Music > Albums: grid con tiles y panel lateral funcional
- [ ] Tab Video > Movies/Actors/TVShows/Genres: mismos componentes, sin regresion
- [ ] `grep -r "@domains/music/shared"` no retorna resultados en dominio video

src/app/shared/
├── components/
│   ├── media-tile/          (mover desde music/shared)
│   │   ├── media-tile.component.ts
│   │   ├── media-tile.component.html
│   │   └── media-tile.component.scss
│   ├── lateral-panel/       (mover desde music/shared)
│   │   ├── lateral-panel.component.ts
│   │   ├── lateral-panel.component.html
│   │   └── lateral-panel.component.scss
│   ├── index.ts             (NUEVO: barrel export)
│   ├── app-shell/           (existente)
│   ├── lateral-slide/       (existente)
│   └── square-item/         (existente)
├── styles/                  (mover desde music/shared)
│   ├── _index.scss
│   ├──_settings.scss
│   └── _tools.scss
├── directives/              (existente, ya tiene tile-hover)
├── pipes/                   (existente)
└── services/                (existente)

```

---

## Pasos

### 1. Mover `styles/` (3 archivos)
- `domains/music/shared/styles/_index.scss` → `shared/styles/_index.scss`
- `domains/music/shared/styles/_settings.scss` → `shared/styles/_settings.scss`
- `domains/music/shared/styles/_tools.scss` → `shared/styles/_tools.scss`

### 2. Mover `media-tile/` (3 archivos)
- Mover los 3 archivos a `shared/components/media-tile/`
- Actualizar `@use` en SCSS: `@use '../../styles' as *` (sigue valido con la nueva estructura)

### 3. Mover `lateral-panel/` (3 archivos)
- Mover los 3 archivos a `shared/components/lateral-panel/`
- Actualizar `@use` en SCSS: `@use '../../styles' as *` (sigue valido)

### 4. Crear barrel `shared/components/index.ts`
```typescript
export { MediaTileComponent, MediaTileAction } from './media-tile/media-tile.component';
export { LateralPanelComponent } from './lateral-panel/lateral-panel.component';
```

### 5. Actualizar 5 imports

| Archivo | Cambio |
|---------|--------|
| `domains/music/album/.../album-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/movie/.../movie-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/actor/.../actor-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/tvshow/.../tvshow-list.component.ts` | `@domains/music/shared` → `@shared/components` |
| `domains/video/genre/.../video-genre-list.component.ts` | `@domains/music/shared` → `@shared/components` |

### 6. Limpiar `domains/music/shared/`

- Eliminar `styles/` (movido)
- Eliminar `components/media-tile/` y `components/lateral-panel/` (movidos)
- Actualizar `index.ts`: quitar exports de MediaTile y LateralPanel (queda vacio → eliminar archivo si no queda nada)

### 7. tsconfig.json

- `@shared/*` ya mapea a `src/app/shared/*` — **sin cambios necesarios**

---

## Verificacion

- [ ] `ng serve` compila sin errores
- [ ] Tab Music > Albums: grid con tiles y panel lateral funcional
- [ ] Tab Video > Movies/Actors/TVShows/Genres: mismos componentes, sin regresion
- [ ] `grep -r "@domains/music/shared"` no retorna resultados en dominio video
