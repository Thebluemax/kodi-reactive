// ==========================================================================
// SHARED - Kodi JSON-RPC Client
// ==========================================================================
// Punto unico por el que pasan las peticiones a Kodi.
//
// Antes cada repositorio redeclaraba el sobre y la peticion, numeraba sus
// llamadas con su propio contador y decidia por su cuenta si mirar el error.
// Cada repeticion era una ocasion de olvidarse de algo, y en cinco
// repositorios se olvidaron del error (#233).
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { KodiConfigService } from './kodi-config.service';
import { Methods } from '@shared/enums/methods';
import {
  assertKodiOk,
  KodiEnvelope,
  unwrapKodiResult
} from '@shared/utils/kodi-envelope';

/**
 * Kodi admite parametros por nombre y por posicion; el reproductor y el mando
 * usan la segunda forma.
 */
export type KodiParams = Record<string, unknown> | unknown[];

interface KodiRequest {
  readonly jsonrpc: '2.0';
  readonly method: string;
  readonly params?: KodiParams;
  readonly id: number;
}

/**
 * Nombre de metodo JSON-RPC.
 *
 * Normalmente sale del enum `Methods`, pero algun dominio guarda los suyos en
 * su propio enumerado —`InputAction` son literalmente `Input.Up`, `Input.Down`—
 * y obligarles a duplicarlos no aportaria nada. La forma `Espacio.Metodo` deja
 * pasar esos y sigue rechazando una cadena cualquiera.
 */
export type KodiMethod = Methods | `${string}.${string}`;

/** Opciones de una peticion suelta. */
export interface KodiRpcOptions {
  /**
   * Sufijo que se anade a la URL. El mando lo usa (`?mediaplayer`), y es lo
   * unico que impedia compartir el cliente con el resto.
   */
  readonly urlSuffix?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KodiRpcService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);

  /**
   * Contador unico para toda la aplicacion.
   *
   * Antes cada repositorio empezaba en 1 por su cuenta, asi que dos peticiones
   * simultaneas de repositorios distintos compartian identificador.
   */
  private requestId = 1;

  /** Peticion cuyo resultado interesa. Lanza si Kodi lo rechaza. */
  query<T>(
    method: KodiMethod,
    params?: KodiParams,
    options: KodiRpcOptions = {}
  ): Observable<T> {
    return this.post<T>(method, params, options).pipe(
      map(response => unwrapKodiResult(response, method))
    );
  }

  /**
   * Orden cuyo resultado no interesa, solo si fue bien.
   *
   * Kodi contesta a estas con la cadena "OK", asi que exigir resultado seria
   * excesivo: basta con que no haya error.
   */
  command(
    method: KodiMethod,
    params?: KodiParams,
    options: KodiRpcOptions = {}
  ): Observable<void> {
    return this.post<unknown>(method, params, options).pipe(
      map(response => {
        assertKodiOk(response, method);
        return void 0;
      })
    );
  }

  private post<T>(
    method: KodiMethod,
    params: KodiParams | undefined,
    options: KodiRpcOptions
  ): Observable<KodiEnvelope<T>> {
    const request: KodiRequest = {
      jsonrpc: '2.0',
      method,
      ...(params ? { params } : {}),
      id: this.requestId++
    };

    return this.http.post<KodiEnvelope<T>>(
      `${this.config.jsonRpcUrl}${options.urlSuffix ?? ''}`,
      request
    );
  }
}
