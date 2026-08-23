# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Importación masiva desde archivo**: Nueva sección en Ajustes que carga un JSON o un NFO de Kodi, empareja cada entrada con su elemento de la biblioteca y muestra el diff campo a campo **antes de escribir nada**. Cubre los cinco medios editables. Kodi no tiene endpoint de importación —hay `Export` pero no su contrapartida—, así que el archivo se parsea en el cliente y se aplica con los mismos `Set*Details` del editor. Una entrada que coincida con varios elementos no se toca: elegir uno sería adivinar, y esto reescribe fichas enteras. Un fallo suelto no tumba el resto del lote y se informa elemento a elemento (#220)
- **Escritura de canciones**: `updateSong` sobre `AudioLibrary.SetSongDetails`, que la importación necesitaba para cubrir los cinco medios. La interfaz de edición de canción sigue pendiente en #204 (#220)
- **Volver a scrapear un medio con el título correcto**: Película y serie ganan «Volver a buscar», que usa `VideoLibrary.RefreshMovie` y `RefreshTVShow`. El parámetro `title` le dice a Kodi con qué buscar en lugar de deducirlo del nombre del archivo, que es de donde vienen la mayoría de los datos equivocados: una sola llamada reescribe todos los campos en vez de corregirlos uno a uno. Se puede ignorar el NFO local, y en series arrastrar el refresco a todos los episodios. Avisa antes de que sobrescribe también las correcciones hechas a mano. Como el scrapeo es asíncrono —el método vuelve enseguida y el trabajo lo hace Kodi por detrás— hay un botón aparte para recargar el detalle cuando termine (#219) El panel de detalle se aparta mientras el diálogo está abierto y se repone al cerrarlo, como ya hacía la edición: el panel se saca a sí mismo a `document.body`, fuera de `ion-app`, así que nada montado dentro de la aplicación queda por encima de él En película el diálogo pide además el año y el IMDb: el año se añade al título entre paréntesis, que es la convención con la que Kodi parsea los nombres de archivo, y el IMDb se escribe con `SetMovieDetails` antes de refrescar, que es lo único que desambigua con garantías porque el scraper respeta el identificador en vez de volver a buscar por título Las opciones van en un modal propio y no en un `ion-alert`: los alerts de Ionic aplican a todos los campos el tipo del primero, así que una casilla junto a campos de texto se renderizaba como caja de texto y perdía su etiqueta, sin aviso alguno
- **Ruta del archivo visible en el detalle**: Película y serie muestran la ruta completa, y las filas de pista y de episodio el nombre del archivo, con la ruta entera en el título emergente. Es sólo lectura: sirve para saber de dónde sacó el scraper los datos cuando salen mal, y la API tampoco permite escribirla. La entidad `TVShow` pasa a llevar `file`. Álbum y artista no tienen ruta en la API —`Audio.Fields.Album` no declara `file`—, así que el álbum muestra la carpeta deducida de sus pistas, etiquetada como tal, y avisa cuando están repartidas en varias en lugar de dar una por buena (#218) La fila ocupa el ancho completo del detalle: los tres paneles son grids de dos columnas con la primera estrecha para la carátula, y sin eso la ruta se pintaba dentro de 200 px, partida cada pocos caracteres
- **Edición de serie**: El detalle de serie gana el botón «Editar», con 16 campos de `VideoLibrary.SetTVShowDetails` más la sección de artwork. Es el primer medio con un campo de valores restringidos: `status` es un enumerado cerrado de cinco valores y estrena el control `select` que el modal traía desde #200 sin consumidores. No hay campo de año: la API no admite escribir `year` para series, sólo `premiered`, y el año que la lista muestra lo deriva Kodi de esa fecha. Con esto quedan cubiertos los cinco medios editables de #192 (#206)
- **Edición de película**: El detalle de película gana el botón «Editar», con 24 campos de `VideoLibrary.SetMovieDetails` más la sección de artwork. La entidad `Movie` pasa a llevar los que le faltaban —`originalTitle`, `sortTitle`, `plotOutline`, `writer`, `tag`, `showlink`, `premiered`, `mpaa`, `imdbNumber`, `votes`, `top250`, `userRating`, `trailer`, `set` y `art`— y las propiedades se separan entre lista y detalle, como en el álbum. `cast` no es editable: la API no lo admite escribir, y es la razón por la que los actores quedaron fuera (#205)
- **Edición de artista**: El detalle de artista gana el botón «Editar», con los 16 campos que `AudioLibrary.SetArtistDetails` admite más la sección de artwork. No hizo falta tocar el modal ni el navegador de ficheros: sólo declarar el esquema y cablear el contenedor. La entidad `Artist` pasa a llevar `sortName`, `type`, `gender`, `disambiguation` y `art`. El identificador de MusicBrainz se lee como lista y se escribe como cadena única —asimetría de la API—, así que el editor muestra el primero y envía uno (#203)
- **Elegir artwork navegando las fuentes de Kodi**: Cada campo de imagen del editor gana un «Buscar en Kodi» que lista las fuentes configuradas, permite entrar en carpetas y previsualiza el archivo antes de asignarlo. Filtra a carpetas e imágenes, por mimetype o por extensión cuando Kodi no lo informa. Se guarda la ruta del archivo, no la URL de descarga que `Files.PrepareDownload` devuelve: esa sirve para mirar, no para persistir. Dominio `files` nuevo, con `Files.GetSources`, `Files.GetDirectory` y `Files.PrepareDownload`, los tres de sólo lectura (#202)
- **Tests de `AlbumFactory`**: La entidad no tenía cobertura. Los specs nuevos fijan el mapeo de los campos que el editor escribe, que el rating decimal del scraper no se redondea, que `isBoxSet` distingue `false` de ausente, y que un álbum llegado de la lista —con menos propiedades— no deja campos en `undefined` (#211)
- **Edición de artwork por URL**: El modal gana una sección de imágenes con las cuatro claves que `Media.Artwork.Set` nombra —thumb, poster, fanart y banner—, las que el medio ya traiga fuera de esas, y un campo para añadir otras, que el tipo admite vía `additionalProperties`. Cada una se previsualiza antes de guardar y se señala si el navegador no logra cargarla, sin bloquear el resto del formulario. Vaciar una caja borra esa imagen. Kodi no recibe archivos: se le indica una URL o ruta y él la descarga y la cachea, así que no hay subida que hacer. La entidad `Album` pasa a llevar `art`, que `getAlbums` y `getAlbumById` ya piden a Kodi (#201)
- **Tests de la edición de álbum**: `AlbumListComponent` gana specs que fijan que el modal no depende del álbum seleccionado. Cerrar el panel emite `panelClosed` y limpia ese estado, así que la edición se apoya en un signal propio: se comprueba que con el detalle ya vacío el modal sigue mostrando los valores, guarda contra el álbum correcto y repone el detalle al terminar (#200)
- **Modal de edición de media**: Nuevo componente compartido `app-media-edit-modal`, dirigido por un esquema que cada medio declara —clave, etiqueta y tipo de control— en vez de un formulario escrito a mano por medio. Emite sólo los campos que el usuario cambió, porque los `Set*Details` de Kodi tratan cada parámetro ausente como «no tocar». Cableado en el detalle de álbum, con toast de éxito o de error. Un número vaciado se ignora: los parámetros numéricos de la API no admiten `null`, así que no hay forma de expresar «quítale el año» (#200)
- **Escritura en la biblioteca**: `updateAlbum` en el repositorio de álbum, sobre `AudioLibrary.SetAlbumDetails`. Es la primera operación de escritura del proyecto: hasta ahora el enum `Methods` solo tenía lecturas, escaneos y notificaciones. El patch es parcial —un campo ausente le dice a Kodi que no lo toque, y `null` borra el valor en las listas y en el artwork— y el error viaja dentro del sobre JSON-RPC con HTTP 200, así que se lee del cuerpo y se propaga como error del Observable en vez de pasar por éxito (#199)
- **Servicio de notificaciones**: Nuevo `NotificationService` compartido con métodos por intención (`success`, `error`, `info`). Hasta ahora cada componente creaba su toast con `ToastController`, con duración, color e icono propios: los mismos avisos se veían distintos según de dónde salieran. Los errores se quedan ahora más tiempo en pantalla que los aciertos, porque hay que leerlos y decidir (#198)
- **Tests de configuración de Kodi**: `KodiConfigService` no tenía cobertura. El spec nuevo lo inyecta de verdad, sin sustituirlo como hacen los demás, para fijar en qué modo corre la suite (#195)
- **Empty state**: Nuevo componente compartido `app-empty-state` que distingue «la biblioteca está vacía» de «el filtro no encontró nada», mostrando en el segundo caso el término buscado y un botón para limpiarlo. Aplicado en las nueve listas, que hasta ahora dejaban la pantalla en blanco sin explicación: un término sin coincidencias era indistinguible de un fallo de carga (#184)
- **Tests de listas y búsqueda**: Specs nuevos para `GlobalSearchService`, `AlbumList`, `MovieList`, `TVShowList`, `ActorList` y `EmptyState`, ninguno de los cuales tenía cobertura

### Changed

- **El editor de álbum expone los 22 campos de la API**: Pasa de 7 a los 22 que `AudioLibrary.SetAlbumDetails` admite escribir. La entidad `Album` no llevaba el resto —`AlbumFactory` descartaba `theme`, `mood`, `type` y `rating` aunque el detalle ya se los pedía a Kodi— y exponerlos sin eso habría mostrado cajas vacías sobre campos con contenido. No hizo falta tocar el modal: los seis tipos de control existentes cubren todo el conjunto (#211)
- **Propiedades separadas entre lista y detalle**: `getAlbums` pedía 17 propiedades cuando sus tarjetas sólo pintan título, artistas, carátula y año; ahora pide cuatro. La lista pagina de 40 en 40, así que cada propiedad de más se pagaba en cada página sin que nadie la leyera, y al abrir el detalle el álbum se recarga entero de todas formas. El conjunto ancho queda en `getAlbumById`, que es quien alimenta el editor (#211)
- **Barra del modal de edición**: Cancelar y Guardar pasan de botones con texto a iconos —una «x» y un disquete—, y el título se va a la derecha, más pequeño y recortado con puntos suspensivos. Los botones con nombre y un título centrado se repartían la barra y dejaban las acciones incómodas, y un título de álbum largo las empujaba (#200)
- **Estado de paginación en signals**: `start`, `end` y `displayCount` pasan de campos planos a `signal<number>`. Varios `computed` los leían directamente, y como Angular no trackea campos planos no se invalidaban al cambiar el valor; funcionaban apoyados en que algún otro signal de la misma expresión notificara. El cuerpo del effect de búsqueda queda envuelto en `untracked()`, para que dependa solo del término y no de los signals de paginación que él mismo escribe. Se elimina el workaround de `actor-list`, que reemplazaba `allActors` entero para forzar la invalidación y obligaba a re-filtrar toda la lista en cada scroll (#183)
- **Empty state de playlists unificado**: `current-play-list` y `saved-playlist-list` tenían su propio markup de lista vacía, uno de ellos además en inglés; ahora usan el componente compartido

### Fixed

- **Botón de guardar siempre deshabilitado en la edición**: El contenedor pasaba los valores actuales con un método en la plantilla, así que devolvía un objeto nuevo en cada ciclo de detección de cambios. El input del modal lo tomaba por un valor distinto y reponía el borrador, borrando lo tecleado antes de que el formulario llegara a considerarse modificado. Pasa a ser un `computed`, cuya referencia solo cambia cuando cambia el álbum que se edita (#200)
- **Modal oculto tras el panel lateral**: `lateral-panel` se saca a sí mismo a `document.body` en su `ngOnInit`, fuera de `ion-app`, así que ningún modal montado dentro de la aplicación podía quedar por encima. Al pulsar «Editar» el panel se aparta y se repone al cerrar el modal; como cerrarlo emite `panelClosed`, que limpia el álbum seleccionado, volver al detalle exige reponerlo. De paso, `$lateral-panel-z-index` valía 40000 mientras los overlays de Ionic se montan a partir de 20000, así que el panel tapaba también toasts y alerts; baja por debajo de ese rango y `lateral-slide` deja de repetir el número a mano (#200)
- **Campos del modal apretados en una franja**: El componente se proyecta dentro del `<ng-template>` del `ion-modal`, donde no hay `ion-page` que le dé altura, así que su `ion-content` colapsaba y los campos quedaban en una tira con scroll diminuto en vez de ocupar el modal (#200)
- **La configuración `ci` compilaba y testeaba como producción**: No definía `fileReplacements`, así que caía en el archivo base `environment.ts`, que declaraba `production: true` con valores de desarrollo. Los tests corrían por tanto en modo producción: `KodiConfigService` tomaba la rama que deriva la conexión de `window.location` en vez de la de desarrollo. No rompía nada —los specs que lo tocaban lo sustituían, y ninguna prueba sale a la red— pero es lo contrario de lo que el flag debería valer bajo test. Ahora cada configuración de `angular.json` nombra su entorno de forma explícita y ninguna depende del archivo base (#195)
- **IP de LAN horneada en el build de producción**: Once repositorios construían su endpoint JSON-RPC con `environment.serverApiUrl` y `environment.apiPort`, que en la configuración `production` valen `http://192.168.0.178` y `8080`. El add-on quedaba apuntando a una IP de la red del autor en cualquier máquina donde se instalara. Pasan a `KodiConfigService`, que en producción deriva protocolo, host y puerto de `window.location` —el add-on lo sirve el propio servidor web de Kodi, así que el origin de la página ya es la dirección correcta—. Los campos de host de `environment.prod.ts` se vacían: solo los lee la rama de desarrollo, pero el objeto entero se emitía como constante del módulo y las cadenas viajaban igual en el bundle (#194)
- **Race de doble carga con filtro activo**: Las listas paginadas disparaban dos peticiones al montarse cuando había un término de búsqueda: `ngOnInit` cargaba sin filtro y el `effect` del constructor volvía a cargar con filtro. Como el handler appendea, si la petición sin filtrar resolvía última contaminaba la lista filtrada y pisaba el total. El `effect` pasa a ser el único punto de entrada, las peticiones van por un `Subject` con `switchMap` que cancela la anterior, y `catchError` va dentro del `switchMap` para que un error no mate la suscripción de larga vida (#180)
- **Filtro al cambiar de sub-sección**: El término sobrevivía al navegar entre sub-secciones de una misma sección (`/music/albums` → `/music/artists`), porque el listener de `NavigationEnd` solo comparaba `music`/`video`/`remote`. Como cada lista filtra por un campo distinto y sin vocabulario en común, arrastrarlo producía una pantalla vacía. Se compara también la sub-sección y se normaliza la URL, descartando query string y fragment antes de parsear (#181)
- **Paginación off-by-one**: El infinite scroll de albums, movies y tvshows hacía `start = end + 1`, pero `end` es exclusivo en el objeto `List.Limits` de Kodi JSON-RPC. Con límite 40, la página 2 arrancaba en 41 y el registro 40 nunca se cargaba; la pérdida era acumulativa, un registro por salto de página (#182)
- **Infinite scroll sin fin**: `hasMoreAlbums`, `hasMoreMovies` y `hasMoreTVShows` leían `this.start` como campo plano y solo recalculaban al notificarse `totalX`. Como el total llega igual en cada respuesta, `set()` deja de notificar por igualdad a partir de la segunda página y la condición quedaba congelada en `true`: el guard nunca cortaba y el scroll seguía pidiendo páginas vacías contra Kodi (#183)

## [0.6.1] - 2026-08-17

### Added

- **Repositorio Kodi**: Nuevo add-on `repo.reaktive` (`xbmc.addon.repository`) que permite a Kodi descubrir y actualizar `webinterface.reaktive` automáticamente, en lugar de reinstalar el zip a mano en cada versión
- **addons_xml_generator**: Script `ops/addons_xml_generator.py` que recorre las carpetas de add-on publicadas y regenera `addons.xml` y `addons.xml.md5`, el índice que Kodi consulta para detectar versiones nuevas
- **Publicación en gh-pages**: El workflow `Release` empaqueta el add-on, lo copia a la rama `gh-pages` con el nombre que exige Kodi (`<id>/<id>-<version>.zip`), regenera el índice y publica el mismo zip como asset de GitHub Release
- **Guard de versión duplicada**: El workflow aborta si esa versión ya está publicada en `gh-pages`, o si `addon.xml` y `package.json` no coinciden (señal de que alguien editó `addon.xml` a mano en vez de usar `npm version`). El input `force` permite sobrescribir a propósito
- **repo:index**: Script `npm run repo:index` para regenerar el índice en local contra un checkout de `gh-pages`

### Changed

- **Base href relativa**: `npm run build` pasa `--base-href ./`, para que la app funcione desde cualquier ruta en la que Kodi sirva el add-on
- **README**: Documentadas las dos vías de instalación (zip manual y repositorio con auto-actualización) y el procedimiento de publicación de versiones

## [0.6.0] - 2026-08-17

### Added

- **Library domain**: Nuevo dominio `library` con arquitectura DDD: entidades `LibraryType`/`LibraryOperation` y `LibraryEvent` con su factory, interfaz `LibraryRepository`, casos de uso `ScanLibrary` y `CleanLibrary`, y `LibraryFacade` que mantiene el estado de cada operación en signals
- **Library maintenance UI**: Sección «Biblioteca» en Settings con botones de escaneo y limpieza para música y vídeo, spinner mientras la operación está en curso, confirmación previa a la limpieza (avisa de la pérdida de entradas si hay unidades de red desconectadas) y toasts de resultado
- **LibraryKodiRepository**: Disparo de las operaciones vía JSON-RPC (`AudioLibrary.Scan/Clean`, `VideoLibrary.Scan/Clean`)
- **LibraryWebSocketAdapter**: Traducción de las notificaciones de Kodi (`OnScanStarted`, `OnScanFinished`, `OnCleanStarted`, `OnCleanFinished`) a `LibraryEvent`; la conexión solo permanece abierta mientras la página de Settings está visible
- **Library tests**: 56 tests unitarios repartidos en cinco specs, uno por capa del dominio

### Changed

- **KodiConfigService**: Expone `jsonRpcUrl`, que en desarrollo apunta al proxy local (`ops/proxy.js`) y en producción al host del add-on
- **LibraryFacade**: La operación se marca como activa de forma optimista, porque la notificación `OnScanStarted` puede tardar; un timeout de seguridad de 10 minutos libera el estado si Kodi nunca notifica el fin

### Removed

- **kodi-relay**: Eliminado `ops/kodi-relay`, sustituido por `ops/proxy.js`, que ya cubre el proxy de desarrollo con las cabeceras CORS que Kodi no envía

## [0.5.1] - 2026-05-29

### Fixed

- **Build budget**: Incrementado límite `anyComponentStyle` de 4 kB a 5 kB en `angular.json`; `remote-control` superaba el límite tras añadir el control de volumen

## [0.5.0] - 2026-05-29

### Added

- **Genre detail page**: Navegación a página de detalle de género (`/music/genres/:genreId`) con estado del router, reemplazando el panel lateral anterior (#168)

### Fixed

- **Genre back route**: Ruta de retroceso corregida de `/collections/genres` (inexistente) a `/music/genres` en `ion-back-button` y `onBack()` (#168)
- **Scroll containers**: Tiles cortados en vistas de lista y detalle; añadidas clases utilitarias `.scroll-list` (`calc(100% - 90px)`) y `.scroll-detail` (`calc(100% - 63px)`) en `_objects.scss`, aplicadas en 9 componentes (#172, closes #169)

### Changed

- **Makefile**: Eliminado path hardcodeado de node para compatibilidad con entornos sin path absoluto

## [0.4.1] - 2026-02-21

### Fixed

- **AssetsPipe tests**: Añadido `provideZonelessChangeDetection()` al `TestBed` del spec para compatibilidad con la configuración zoneless del proyecto
- **Husky pre-commit**: Creado `~/.config/husky/init.sh` para inicializar NVM y exponer `node`/`npm`/`npx` al entorno de ejecución de los hooks
- **Husky hooks**: Añadidos permisos de ejecución (`chmod +x`) a `pre-commit` y `pre-push`
- **lint-staged**: Migrado de config inline en `package.json` a `.lintstagedrc.js` con función que omite rutas de archivo al invocar `ng lint app --fix`, resolviendo el error `Invalid values: Argument: project`

## [0.4.0] - 2026-02-21

### Added

- **Settings page**: Nueva página de configuración con selección de tema (sistema, claro u oscuro) y sección de conexión Kodi (#162)
- **KodiConfigService**: Servicio de configuración que auto-descubre protocolo, host y puerto HTTP desde `window.location` en producción y usa `environment` en desarrollo (#162)
- **WebSocket port config**: Puerto WebSocket configurable mediante signal y persistido en localStorage (#162)

### Changed

- **AssetsPipe**: Refactorizado de regex frágiles a `encodeURIComponent` nativo; eliminado argumento `scape` en todos los templates (#162)
- **PlayerWebSocketAdapter**: Reemplaza uso directo de `environment` por `KodiConfigService` (#162)
- **AppShellComponent**: Usa `inject(AssetsPipe)` con `providers[]` en lugar de `new AssetsPipe()` (#162)
- **Environments**: Añadido `kodiHttpPort` (8080) en los tres entornos, separado de `apiPort`, para distinguir el HTTP server de Kodi del proxy JSON-RPC (#162)
- **App shell**: Botón de ajustes ahora navega a `/settings` (#162)
- **Lint-staged**: Actualizado para usar `ng lint` en lugar de `eslint` directamente (#162)

### Fixed

- **AssetsPipe test**: Corregido error en `src/app/shared/pipes/assets.pipe.spec.ts`

## [0.3.0] - 2026-02-17

### Added

- **Current track**: Visualización de la pista en reproducción actual

### Fixed

- **Light theme**: Corrección de problemas de visualización en el tema claro
- **Media player URL**: Corrección de la URL que controla el mediaplayer

### Changed

- **Git hooks**: Configuración de Husky y lint-staged

## [0.2.0] - 2026-02-13

### Added

- **SemVer sync**: Implementar versionado SemVer 0.x.y con sincronización automática de addon.xml (#154)
- **Repo URL**: Agregada la URL del repositorio en package.json y addon.xml

### Changed

- **Packaging**: Ajustes en la estructura del archivo final para la release (#153)
- **Addon metadata**: Actualizaciones en la descripción del addon

## [0.1.0] - 2026-02-13

First stable release of Kodi Reactive, a modern web interface for Kodi.

### Added

- **Theme toggle**: Toggle manual entre tema claro y oscuro con reestructuración de estilos ITCSS (#149)
- **Background blur**: Fondo blur con album art en control-nav y página remote (#148)
- **Play/Queue buttons**: Botones de play y add-to-queue con comportamiento touch en móviles (#147)
- **CI/CD packaging**: Automatización del empaquetado del addon con workflow_dispatch (#145)
- **Playlist save feedback**: Toast de confirmación al guardar playlist y refresco de lista (#143)
- **Timebar relocation**: Barra de progreso reubicada sobre los controles de transporte (#141)
- **Dynamic page title**: Nombre de la media en reproducción como título del documento (#140)
- **Playlist management**: Sección de gestión de playlists guardadas con ruta independiente (#139)
- **Artist detail redesign**: Reubicación del header de artist-detail y mejoras en descripciones (#138)
- **Hash navigation**: Navegación por hashes para evitar errores al recargar (#128)
- **Remote control**: Sección de control remoto con navegación en Kodi, botones de repeat, shuffle y party mode (#113, #127)
- **Search**: Funcionalidad de búsqueda global en app-shell (#116)
- **App header**: Cabecera con brand icon, acciones y controles del player (#109)
- **Video domain**: Dominio de TV Shows, Video Genres, Movies, y Actors (#99, #101, #103, #106)
- **Layout extraction**: Layout principal extraído fuera de music como estructura compartida (#96)
- **URL standardization**: Centralización de URLs hardcodeadas en configuración (#93)
- **Playlist domain**: Funcionalidades de playlist con arquitectura DDD (#84)
- **Player DDD**: Refactorización de PlayerControl a arquitectura DDD (#81)
- **Genre domain**: Entidad Genre con repositorio, use cases y UI de chips horizontales (#68-#75)
- **Artist domain**: Migración del dominio Artist a arquitectura DDD (#54)
- **Album domain**: Dominio Album con DDD: entidad, repositorio, use cases y presentación (#46, #52)
- **CI/CD**: Configuración de pipelines con GitHub Actions (#122)

### Changed

- **Player UI**: Rediseño del layout del reproductor con estructura responsive (#121)
- **Media tile**: Rediseño con layout único, header abajo y overlay de acciones en hover, CSS Grid responsive (#124)
- **Navigation**: Migración a estructura basada en features DDD (#91)
- **Components**: Refactorización de estructura de componentes y migración de Input/Output a Signals (#86, #88)
- **Standalone migration**: Migración de todos los componentes a standalone e imports de Ionic (#37)
- **Zoneless**: Migración a zoneless change detection (#44)
- **Angular 20**: Actualización desde Angular 17 → 18 → 19 → 20 con Ionic 8.7.17 (#27, #32, #39)
- **ESLint**: Reactivación de reglas de calidad como error y corrección de violaciones (#120)

### Fixed

- **Playlist save**: Corrección del guardado de playlists (#143)
- **Genre panel**: Panel lateral al seleccionar género musical (#119)
- **Container height**: Altura del contenedor de lista de videos (#118)
- **Artist play**: Corrección de play en detalles de artistas (#76)
- **Tests**: Corrección de tests para compatibilidad con zoneless Angular (#120)
