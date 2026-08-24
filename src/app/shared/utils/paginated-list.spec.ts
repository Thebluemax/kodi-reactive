import { appendPage } from './paginated-list';

interface Item {
  readonly id: number;
}

const idOf = (item: Item): number => item.id;

describe('appendPage', () => {
  it('encadena las páginas en orden', () => {
    const result = appendPage([{ id: 1 }], [{ id: 2 }, { id: 3 }], idOf);

    expect(result.map(idOf)).toEqual([1, 2, 3]);
  });

  it('descarta lo que ya estaba', () => {
    // Una peticion fuera de rango hace que Kodi devuelva de nuevo lo que ya se
    // tenia, y el appendeo lo sumaria otra vez.
    const result = appendPage([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], idOf);

    expect(result.map(idOf)).toEqual([1, 2, 3]);
  });

  it('no altera la lista cuando la página entera es repetida', () => {
    const current = [{ id: 1 }, { id: 2 }];

    expect(appendPage(current, [{ id: 1 }, { id: 2 }], idOf).map(idOf)).toEqual([1, 2]);
  });

  it('acepta una página vacía', () => {
    expect(appendPage([{ id: 1 }], [], idOf).map(idOf)).toEqual([1]);
  });

  it('parte de cero sin lista previa', () => {
    expect(appendPage([], [{ id: 1 }], idOf).map(idOf)).toEqual([1]);
  });
});
