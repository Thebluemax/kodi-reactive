import { buildSearchTitle } from './media-refresh.type';

describe('buildSearchTitle', () => {
  it('añade el año entre paréntesis, que es como Kodi parsea los nombres', () => {
    expect(buildSearchTitle('El Padrino', '1972')).toBe('El Padrino (1972)');
  });

  it('deja el título intacto sin año', () => {
    expect(buildSearchTitle('El Padrino')).toBe('El Padrino');
    expect(buildSearchTitle('El Padrino', '   ')).toBe('El Padrino');
  });

  it('no duplica el año que el título ya trae', () => {
    expect(buildSearchTitle('El Padrino (1972)', '1972')).toBe('El Padrino (1972)');
  });

  it('recorta los espacios de ambos', () => {
    expect(buildSearchTitle('  El Padrino  ', ' 1972 ')).toBe('El Padrino (1972)');
  });

  it('sin título devuelve cadena vacía, que Kodi lee como «dedúcelo del archivo»', () => {
    expect(buildSearchTitle('', '1972')).toBe('');
  });
});
