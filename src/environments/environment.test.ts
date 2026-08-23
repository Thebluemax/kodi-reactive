// Entorno de los tests: lo selecciona el target `test` de angular.json vía
// fileReplacements, tanto en local como en CI. Sin hosts reales: los specs que
// necesitan una URL concreta sustituyen KodiConfigService.
export const environment = {
  production: false,
  serverUrl: 'http://localhost',
  serverApiUrl: 'http://localhost',
  socketServer: 'localhost',
  socketPort: 9090,
  kodiHttpPort: 8080,
  apiPort: 8008,
  jsonrpcVersion: '2.0',
};
