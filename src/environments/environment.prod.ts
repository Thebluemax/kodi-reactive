// En producción la app la sirve el propio servidor web de Kodi, así que
// KodiConfigService deriva protocolo, host y puerto HTTP de window.location.
// Los valores de host de aquí abajo solo los lee la rama de desarrollo del
// servicio: se dejan vacíos para no hornear una IP de LAN en el bundle.
export const environment = {
  production: true,
  serverUrl: '',
  serverApiUrl: '',
  socketServer: '',
  socketPort: 9090,
  kodiHttpPort: 8080,
  apiPort: 8080,
  jsonrpcVersion: '2.0',
};
