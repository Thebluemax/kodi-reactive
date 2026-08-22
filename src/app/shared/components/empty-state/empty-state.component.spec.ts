import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { EmptyStateComponent } from './empty-state.component';
import { GlobalSearchService } from '@shared/services/global-search.service';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;
  let searchStub: {
    isSearchVisible: ReturnType<typeof signal<boolean>>;
    debouncedSearchTerm: ReturnType<typeof signal<string>>;
    clearSearch: jasmine.Spy;
  };

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(async () => {
    searchStub = {
      isSearchVisible: signal(true),
      debouncedSearchTerm: signal(''),
      clearSearch: jasmine.createSpy('clearSearch')
    };

    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GlobalSearchService, useValue: searchStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'No hay álbumes en la biblioteca');
    fixture.detectChanges();
  });

  it('muestra el mensaje de biblioteca vacia cuando no hay filtro', () => {
    expect(text()).toContain('No hay álbumes en la biblioteca');
  });

  it('muestra el hint solo si se le pasa', () => {
    expect(text()).not.toContain('Pista util');

    fixture.componentRef.setInput('hint', 'Pista util');
    fixture.detectChanges();

    expect(text()).toContain('Pista util');
  });

  it('cambia al mensaje de sin resultados cuando hay filtro activo', () => {
    searchStub.debouncedSearchTerm.set('nirvana');
    fixture.detectChanges();

    expect(text()).toContain('Sin resultados para');
    expect(text()).toContain('nirvana');
    expect(text()).not.toContain('No hay álbumes en la biblioteca');
  });

  it('ignora el termino en las secciones sin buscador', () => {
    searchStub.debouncedSearchTerm.set('nirvana');
    searchStub.isSearchVisible.set(false);
    fixture.detectChanges();

    expect(text()).toContain('No hay álbumes en la biblioteca');
    expect(text()).not.toContain('Sin resultados para');
  });

  it('limpia la busqueda al pulsar el boton', () => {
    searchStub.debouncedSearchTerm.set('nirvana');
    fixture.detectChanges();

    const button: HTMLElement | null =
      fixture.nativeElement.querySelector('ion-button');
    button?.click();

    expect(searchStub.clearSearch).toHaveBeenCalledWith();
  });
});
