# ReaKtive

> A modern, reactive web interface to control your Kodi media center.

<p align="center">
  <img src="src/assets/site/dark.basic.png" alt="ReaKtive Dark Theme" width="400" />
  <img src="src/assets/site/light.basic.png" alt="ReaKtive Light Theme" width="400" />
</p>

**ReaKtive** is a web-based frontend built with **Angular** and **Ionic** that lets you remotely browse, manage and control your Kodi media library and playback in real time. It is designed to be packaged as an official **Kodi Add-on** (`webinterface.reaktive`).

---

## Features

- **Music & Video browsing** - Albums, Artists, Genres, Movies, TV Shows and Actors
- **Real-time playback control** - Play, pause, stop, seek, volume, shuffle, repeat and party mode
- **Remote control** - Full D-Pad navigation to operate Kodi from any browser
- **Playlist management** - View, reorder and save playlists
- **Global search** - Search across your entire media library
- **Light & Dark themes** - Automatic detection of OS preference with manual toggle
- **Responsive design** - Desktop and mobile layouts
- **Background blur** - Album art blur effect on the player bar and remote view

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Angular 20                          |
| UI Components  | Ionic 8                             |
| Architecture   | Domain-Driven Design (DDD)          |
| Real-time      | WebSockets (port 9090)              |
| API            | JSON-RPC over HTTP (port 8008)      |
| State          | Angular Signals (zoneless)          |
| Styling        | SCSS with ITCSS methodology         |
| Linting        | ESLint + Husky + lint-staged        |
| CI/CD          | GitHub Actions                      |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- A running **Kodi** instance with:
  - **Web interface** enabled (_Settings > Services > Control > Allow remote control via HTTP_)
  - **WebSocket** access on port `9090`
  - **HTTP JSON-RPC** access on port `8008`

## Installation

```bash
# Clone the repository
git clone https://github.com/Thebluemax/kodi-reactive.git
cd kodi-reactive

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`.

## Build

```bash
# Production build
npm run build
```

The output is generated in `dist/` and can be served by any static file server or packaged as a Kodi add-on.

### Install as Kodi Add-on

1. Run `npm run build` to generate the production build.
2. Copy the contents of `dist/` along with `addon.xml` and `icon.png` into a folder named `webinterface.reaktive`.
3. Zip the folder and install it in Kodi via _Settings > Add-ons > Install from zip file_.
4. Activate the web interface in _Settings > Services > Control > Web interface_.

## Available Scripts

| Command                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `npm start`            | Start the development server                    |
| `npm run build`        | Production build                                |
| `npm run lint`         | Run ESLint                                      |
| `npm test`             | Run unit tests                                  |
| `npm run create-issue` | Create a GitHub issue via webhook                |

## Project Structure

```
src/app/
├── components/        # Reusable UI components
├── core/              # Services, models, legacy infrastructure
│   ├── models/        # Current entities (being migrated)
│   ├── services/      # HTTP and WebSocket services
│   └── enums/         # JSON-RPC methods and actions
├── domains/           # DDD structure
│   ├── music/         # Albums, Artists, Genres, Player, Playlist
│   ├── video/         # Movies, TV Shows, Actors
│   └── remote/        # Remote control
├── layout/            # App shell and main layout
└── shared/            # Shared module (pipes, components, services)
```

## Roadmap

- [ ] Migrate to Angular 21
- [ ] Complete DDD architecture (domain models, application services, repositories)
- [ ] Externalize configuration (remove hardcoded URLs and ports)
- [ ] Official Kodi Add-on packaging with automated releases
- [ ] Expand video support (Movies, TV Shows)
- [ ] Mobile-first improvements and PWA support

## FAQ

**Q: Does ReaKtive work on mobile devices?**
A: Yes. The interface is fully responsive and adapts to both desktop and mobile screens.

**Q: Which Kodi versions are supported?**
A: ReaKtive targets Kodi 19 (Matrix) and later, using JSON-RPC API v6+.

**Q: Can I use it outside my local network?**
A: Yes, as long as you can reach your Kodi instance's ports (9090 and 8008). A reverse proxy with authentication is recommended for security.

**Q: How do I change the Kodi connection settings?**
A: Currently the ports are configured in the application. Externalizing the configuration is on the roadmap.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is distributed as a Kodi Add-on. See [addon.xml](addon.xml) for metadata.

## Contact

- **Author**: [Thebluemax](https://maximilianofernandez.net/)
- **Repository**: [github.com/Thebluemax/kodi-reactive](https://github.com/Thebluemax/kodi-reactive)
- **Issues**: [GitHub Issues](https://github.com/Thebluemax/kodi-reactive/issues)
