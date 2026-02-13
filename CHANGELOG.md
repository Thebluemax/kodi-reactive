# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
