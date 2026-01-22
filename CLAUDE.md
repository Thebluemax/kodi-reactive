# Contexto del Proyecto: Kodi Reactive

## Resumen Ejecutivo

- **Descripcion**: Un frontend moderno y reactivo diseñado especificamente para controlar Kodi.
- **Objetivo Principal**: Crear una interfaz de usuario intuitiva que se comunique con Kodi para gestionar la reproduccion y la biblioteca.
- **Meta de Distribucion**: El proyecto final sera empaquetado como un Add-on (complemento) oficial de Kodi, permitiendo que otros usuarios lo instalen directamente en sus sistemas.

## Estado del Proyecto

**Fase actual**: Prototipo en migracion

Este proyecto es un **prototipo funcional** que esta siendo migrado hacia una arquitectura DDD completa. El MVP debe poder instalarse manualmente en Kodi y funcionar como interfaz alternativa.

### Deuda Tecnica Conocida

- URLs y puertos hardcodeados (deben moverse a configuracion)
- Entidades del dominio por refactorizar segun estandares DDD
- Typos en codigo legacy (`albunDetail`, `setSeeek`)
- Cobertura de tests por mejorar

## Especificaciones Tecnicas

- **Framework**: Angular 17 + Ionic 8 (meta: migrar a Angular 21)
- **Arquitectura**: DDD (Domain-Driven Design) - en migracion
- **Comunicacion**: Sistema hibrido:
  - **WebSockets**: Para comunicacion en tiempo real (puerto 9090)
  - **API REST (JSON-RPC)**: Para peticiones puntuales y gestion de biblioteca (puerto 8008)

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
├── components/        # Componentes UI reutilizables
├── core/              # Servicios, modelos, infraestructura legacy
│   ├── models/        # Entidades actuales (en migracion)
│   ├── services/      # Servicios HTTP y WebSocket
│   └── enums/         # Metodos JSON-RPC y acciones
├── domains/           # Nueva estructura DDD
│   └── music/
│       └── playlist/
│           └── infrastructure/
└── shared/            # Modulo compartido
```

## Roadmap

- [ ] Migrar a Angular 21
- [ ] Completar arquitectura DDD (domain models, application services, repositories)
- [ ] Externalizar configuracion (eliminar hardcoded values)
- [ ] Empaquetar como Add-on oficial de Kodi
- [ ] Expandir soporte: Video (Movies, TV Shows) ademas de Music

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
