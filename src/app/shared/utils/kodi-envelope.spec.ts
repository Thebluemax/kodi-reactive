import { assertKodiOk, unwrapKodiResult } from './kodi-envelope';

describe('unwrapKodiResult', () => {
  it('devuelve el resultado cuando la petición fue bien', () => {
    expect(unwrapKodiResult({ result: { total: 3 } })).toEqual({ total: 3 });
  });

  it('lanza con el mensaje de Kodi', () => {
    // El error llega con HTTP 200: sin mirar el sobre pasaria por exito.
    expect(() =>
      unwrapKodiResult({ error: { code: -32601, message: 'Method not found' } })
    ).toThrowError(/Method not found/);
  });

  it('incluye el código, que es lo que permite buscarlo', () => {
    expect(() =>
      unwrapKodiResult({ error: { code: -32601, message: 'Method not found' } })
    ).toThrowError(/-32601/);
  });

  it('lanza si no hay ni resultado ni error', () => {
    expect(() => unwrapKodiResult({})).toThrowError(/ningún resultado/);
  });

  it('acepta un resultado vacío que sí existe', () => {
    expect(unwrapKodiResult({ result: [] })).toEqual([]);
  });

  it('acepta el cero y la cadena vacía como resultados válidos', () => {
    expect(unwrapKodiResult({ result: 0 })).toBe(0);
    expect(unwrapKodiResult({ result: '' })).toBe('');
  });
});

describe('assertKodiOk', () => {
  it('no lanza cuando no hay error', () => {
    expect(() => assertKodiOk({ result: 'OK' })).not.toThrow();
  });

  it('no exige resultado', () => {
    // Kodi contesta "OK" a las ordenes; exigir resultado seria excesivo.
    expect(() => assertKodiOk({})).not.toThrow();
  });

  it('lanza tambien en las ordenes, con el mensaje de Kodi', () => {
    expect(() =>
      assertKodiOk({ error: { code: -32602, message: 'Invalid params' } })
    ).toThrowError(/Invalid params/);
  });
});
