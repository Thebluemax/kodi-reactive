// Archivo base. Todas las configuraciones de angular.json lo reemplazan por su
// entorno concreto (environment.prod.ts, environment.development.ts o
// environment.test.ts), así que estos valores no deberían llegar a ejecutarse.
// Se mantienen inocuos —sin producción y sin hosts de una red concreta— para
// que una configuración a la que se le olvide el fileReplacements falle contra
// localhost en vez de contra la LAN de otra persona.

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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
