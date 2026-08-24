// ==========================================================================
// SHARED - Kodi JSON-RPC Envelope
// ==========================================================================
// Kodi responde a los rechazos con HTTP 200 y el fallo dentro del cuerpo, asi
// que un error suyo no llega como error de red: hay que leerlo del sobre.
//
// Sin esto, unas peticiones reventaban al leer `result.algo` sobre un undefined
// —con un "Cannot read properties of undefined" que no dice nada— y otras, las
// que ignoran la respuesta, daban el fallo por bueno.
// ==========================================================================

export interface KodiEnvelope<T> {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Devuelve el resultado, o lanza con lo que Kodi haya dicho.
 *
 * El mensaje sale tal cual de Kodi porque es el unico dato util para saber que
 * paso; quien llame decide que contarle al usuario.
 */
export function unwrapKodiResult<T>(response: KodiEnvelope<T>): T {
  if (response.error) {
    throw new Error(
      `Kodi ha rechazado la petición: ${response.error.message} (código ${response.error.code})`
    );
  }

  if (response.result === undefined || response.result === null) {
    throw new Error('Kodi no ha devuelto ningún resultado');
  }

  return response.result;
}

/**
 * Para las peticiones cuyo resultado no interesa, solo si fueron bien.
 *
 * Kodi contesta a estas con la cadena "OK", asi que exigir un resultado seria
 * excesivo: basta con que no haya error.
 */
export function assertKodiOk(response: KodiEnvelope<unknown>): void {
  if (response.error) {
    throw new Error(
      `Kodi ha rechazado la petición: ${response.error.message} (código ${response.error.code})`
    );
  }
}
