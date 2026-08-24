# Contexto del Proyecto: Kodi Reactive

## Resumen Ejecutivo

- **Descripcion**: Un frontend moderno y reactivo diseñado especificamente para controlar Kodi.
- **Objetivo Principal**: Crear una interfaz de usuario intuitiva que se comunique con Kodi para gestionar la reproduccion y la biblioteca.
- **Meta de Distribucion**: El proyecto final sera empaquetado como un Add-on (complemento) oficial de Kodi, permitiendo que otros usuarios lo instalen directamente en sus sistemas.

## Estado del Proyecto

**Fase actual**: v1.0.0

El prototipo quedo atras: la arquitectura DDD cubre todos los dominios, la
configuracion se resuelve en tiempo de ejecucion y el add-on se publica por su
propio repositorio Kodi, con actualizaciones automaticas.

### Deuda Tecnica Conocida

- Interfaz solo en castellano; queda migrar a i18n con ingles (#242)
- Angular 20; la migracion a 22 esta pendiente (#237)
- Edicion de canciones sueltas sin interfaz (#204)
- Favoritos de Kodi sin soportar (#217)

## Especificaciones Tecnicas

- **Framework**: Angular 20 + Ionic 8, standalone y zoneless (meta: migrar a Angular 22)
- **Arquitectura**: DDD (Domain-Driven Design)
- **Comunicacion**: Sistema hibrido, con un unico punto de contacto por canal:
  - **WebSockets**: Tiempo real, via `KodiSocketService` (puerto 9090 por defecto, ajustable en Ajustes)
  - **JSON-RPC sobre HTTP**: Lecturas y escrituras de biblioteca, via `KodiRpcService`
    (en produccion el add-on lo sirve el propio Kodi y la conexion se deriva de
    `window.location`; en desarrollo pasa por `ops/proxy.js`, que añade CORS)

## Interfaz y Experiencia (UI/UX)

- **Gestion de Temas**: Soporte nativo para Tema Claro y Tema Oscuro (detecta preferencia del SO)

## Reglas de Negocio y Estructura (DDD)

1. **Capa de Dominio**: Entidades de Kodi (Album, Artist, Track, Genre, Player, Playlist)
2. **Capa de Infraestructura**: Implementacion de servicios para la API y WebSockets
3. **Capa de Aplicacion**: Casos de uso (Reproducir, Pausar, Cambiar Tema)
4. **Capa de Presentacion**: Componentes de Angular desacoplados

### Estructura de Carpetas

```text
src/app/
├── domains/           # Un contexto por carpeta
│   ├── music/         # Album, Artist, Genre, Track, Player, Playlist, Playback
│   ├── video/         # Movie, TVShow, Actor
│   ├── library/       # Eventos de escaneo y limpieza
│   ├── files/         # Navegador de ficheros de Kodi
│   ├── remote/        # Mando a distancia
│   └── settings/      # Ajustes de conexion
├── layout/            # Shell de la aplicacion
└── shared/            # Servicios RPC y socket, componentes, pipes, utilidades
```

Cada dominio repite las cuatro capas: `domain/` (entidades e interfaces de
repositorio, sin Angular ni HTTP), `application/` (casos de uso y facades),
`infrastructure/` (repositorios que hablan JSON-RPC) y `presentation/`
(componentes standalone, OnPush, con signals).

## Roadmap

- [x] Completar arquitectura DDD (domain models, application services, repositories)
- [x] Externalizar configuracion (eliminar hardcoded values)
- [x] Empaquetar como Add-on de Kodi, con repositorio propio y releases automaticas
- [x] Expandir soporte: Video (Movies, TV Shows, Actors) ademas de Music
- [x] Edicion de biblioteca: metadatos, artwork, re-scrapeo, exportar/importar
- [ ] i18n: castellano e ingles (#242)
- [ ] Migrar a Angular 22 (#237)
- [ ] Edicion de canciones (#204)
- [ ] Favoritos (#217)

## Rol de la IA (Claude)

"Actua como un Arquitecto Frontend Senior experto en Angular y DDD. Tu mision es ayudarme a escribir codigo limpio, modular y reactivo."

### Principios de Desarrollo

- Respetar la arquitectura DDD en nuevas implementaciones
- Codigo limpio y siguiendo estandares de Angular
- No introducir mas deuda tecnica
- Refactorizar progresivamente el codigo legacy
- **NUNCA afirmar que una tarea esta finalizada sin verificacion QA del operador**

### Herramientas

- **MCP Memory**: Usar el servidor MCP de memoria para persistir contexto entre sesiones
- **Script de Issues**: Crear issues en GitHub via webhook

## Gestion de Tareas

### Reglas de Organizacion

1. **Atomicidad**: Las tareas deben ser atomicas (pequeñas, independientes, completables en una sesion)
2. **Issues obligatorios**: Todo lo que se analice y decida implementar debe crear un issue en GitHub
3. **Tareas grandes**: Dividir en subtareas atomicas, cada una con su propio issue

### Crear Issues

```bash
# Uso (UNA sola etiqueta por issue)
npm run create-issue -- "descripcion del problema" label

# Labels disponibles
# - feature     : Nueva funcionalidad
# - bugfix      : Correccion de errores
# - enhancement : Mejora de funcionalidad existente

# Ejemplos
npm run create-issue -- "Migrar entidad Album a DDD" feature
npm run create-issue -- "Corregir typo albunDetail en payloads" bugfix
npm run create-issue -- "Externalizar URL de Kodi a configuracion" enhancement
```

### Flujo de Trabajo

1. Analizar y discutir la tarea con el operador
2. Dividir en subtareas atomicas si es necesario
3. Crear issue(s) para cada tarea/subtarea
4. Implementar
5. Verificacion QA por el operador
6. Cerrar issue
