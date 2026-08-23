import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MediaEditModalComponent } from './media-edit-modal.component';
import {
  MediaEditPatch,
  MediaEditSchema,
  MediaEditValue
} from '@shared/types/media-edit-schema.type';

const SCHEMA: MediaEditSchema = [
  { key: 'title', label: 'Título', kind: 'text' },
  { key: 'year', label: 'Año', kind: 'number' },
  { key: 'genres', label: 'Géneros', kind: 'string-list' },
  { key: 'isBoxSet', label: 'Caja', kind: 'boolean' },
  {
    key: 'status',
    label: 'Estado',
    kind: 'select',
    options: [
      { value: 'ended', label: 'Finalizada' },
      { value: 'cancelled', label: 'Cancelada' }
    ]
  }
];

const VALUE: Record<string, MediaEditValue> = {
  title: 'Kid A',
  year: 2000,
  genres: ['Electronic', 'Rock'],
  isBoxSet: false,
  status: 'ended'
};

describe('MediaEditModalComponent', () => {
  let fixture: ComponentFixture<MediaEditModalComponent>;
  let component: MediaEditModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaEditModalComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaEditModalComponent);
    fixture.componentRef.setInput('schema', SCHEMA);
    fixture.componentRef.setInput('value', VALUE);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  function fieldOf(key: string) {
    return SCHEMA.find(f => f.key === key)!;
  }

  function capturePatch(): MediaEditPatch | undefined {
    let patch: MediaEditPatch | undefined;
    component.save.subscribe(p => (patch = p));
    component.onSave();
    return patch;
  }

  it('parte de los valores actuales del medio', () => {
    expect(component.fieldValue(fieldOf('title'))).toBe('Kid A');
    expect(component.fieldValue(fieldOf('genres'))).toEqual(['Electronic', 'Rock']);
  });

  it('no está sucio hasta que se toca algo', () => {
    expect(component.isDirty()).toBeFalse();
  });

  it('no emite nada si se guarda sin cambios', () => {
    let saved = false;
    let cancelled = false;
    component.save.subscribe(() => (saved = true));
    component.cancelled.subscribe(() => (cancelled = true));

    component.onSave();

    expect(saved).toBeFalse();
    expect(cancelled).toBeTrue();
  });

  it('emite solo el campo modificado', () => {
    component.onFieldChange(fieldOf('title'), 'Amnesiac');

    expect(capturePatch()).toEqual({ title: 'Amnesiac' });
  });

  it('convierte la caja de texto en lista de cadenas', () => {
    component.onFieldChange(fieldOf('genres'), 'Rock,  Pop , ');

    expect(capturePatch()).toEqual({ genres: ['Rock', 'Pop'] });
  });

  it('no considera cambio reordenar el texto a la misma lista', () => {
    component.onFieldChange(fieldOf('genres'), 'Electronic, Rock');

    expect(component.isDirty()).toBeFalse();
  });

  it('convierte el número a number, no a cadena', () => {
    component.onFieldChange(fieldOf('year'), '2001');

    expect(capturePatch()).toEqual({ year: 2001 });
  });

  it('ignora un número vaciado, porque la API no admite null en enteros', () => {
    component.onFieldChange(fieldOf('year'), '');

    expect(component.isDirty()).toBeFalse();
  });

  it('emite el booleano y el select', () => {
    component.onFieldChange(fieldOf('isBoxSet'), true);
    component.onFieldChange(fieldOf('status'), 'cancelled');

    expect(capturePatch()).toEqual({ isBoxSet: true, status: 'cancelled' });
  });

  it('descarta lo tecleado si cambia el medio que edita', () => {
    component.onFieldChange(fieldOf('title'), 'Amnesiac');

    fixture.componentRef.setInput('value', { ...VALUE, title: 'In Rainbows' });
    fixture.detectChanges();

    expect(component.fieldValue(fieldOf('title'))).toBe('In Rainbows');
    expect(component.isDirty()).toBeFalse();
  });

  // ========================================================================
  // Artwork
  // ========================================================================

  describe('artwork', () => {
    const ART = { thumb: 'http://host/cover.jpg', clearlogo: 'http://host/logo.png' };

    beforeEach(() => {
      fixture.componentRef.setInput('artwork', ART);
      fixture.detectChanges();
    });

    it('se oculta si el medio no trae artwork', () => {
      fixture.componentRef.setInput('artwork', null);
      fixture.detectChanges();

      expect(component.hasArtwork()).toBeFalse();
    });

    it('ofrece siempre las cuatro claves conocidas', () => {
      expect(component.artKeys()).toEqual(
        jasmine.arrayContaining(['thumb', 'poster', 'fanart', 'banner'])
      );
    });

    it('conserva las claves que el medio ya traía fuera de las conocidas', () => {
      expect(component.artKeys()).toContain('clearlogo');
    });

    it('parte de las URLs actuales', () => {
      expect(component.artValue('thumb')).toBe('http://host/cover.jpg');
      expect(component.artValue('poster')).toBe('');
    });

    it('no está sucio hasta que se toca una imagen', () => {
      expect(component.isDirty()).toBeFalse();
    });

    it('emite solo las claves de arte modificadas', () => {
      component.onArtChange('poster', 'http://host/poster.jpg');

      expect(capturePatch()).toEqual({
        art: { poster: 'http://host/poster.jpg' }
      });
    });

    it('vaciar una caja borra ese artwork con null', () => {
      component.onArtChange('thumb', '  ');

      expect(capturePatch()).toEqual({ art: { thumb: null } });
    });

    it('marca la imagen que el navegador no logra cargar', () => {
      component.onArtLoadError('thumb');

      expect(component.isArtBroken('thumb')).toBeTrue();
    });

    it('una imagen rota no impide guardar el resto', () => {
      component.onArtLoadError('thumb');
      component.onFieldChange(fieldOf('title'), 'Amnesiac');

      expect(component.isDirty()).toBeTrue();
      expect(capturePatch()).toEqual({ title: 'Amnesiac' });
    });

    it('deja de marcarla en cuanto carga', () => {
      component.onArtLoadError('thumb');
      component.onArtLoaded('thumb');

      expect(component.isArtBroken('thumb')).toBeFalse();
    });

    it('permite añadir un tipo de imagen que el medio no traía', () => {
      component.newArtKey.set('discart');
      component.onAddArtKey();

      expect(component.artKeys()).toContain('discart');
    });

    it('no duplica una clave existente ni acepta la cadena vacía', () => {
      component.newArtKey.set('thumb');
      component.onAddArtKey();
      component.newArtKey.set('   ');
      component.onAddArtKey();

      expect(component.artKeys().filter(k => k === 'thumb').length).toBe(1);
      expect(component.artKeys()).not.toContain('');
    });

    it('el navegador de Kodi entra y sale sin tocar el borrador', () => {
      component.onFieldChange(fieldOf('title'), 'Amnesiac');

      component.onBrowse('poster');

      expect(component.isBrowsing()).toBeTrue();

      component.onBrowseCancelled();

      expect(component.isBrowsing()).toBeFalse();
      expect(component.fieldValue(fieldOf('title'))).toBe('Amnesiac');
    });

    it('la ruta elegida en Kodi va al campo de arte que se estaba buscando', () => {
      component.onBrowse('poster');
      component.onFilePicked('smb://nas/fotos/cover.jpg');

      expect(component.isBrowsing()).toBeFalse();
      expect(component.artValue('poster')).toBe('smb://nas/fotos/cover.jpg');
      expect(capturePatch()).toEqual({
        art: { poster: 'smb://nas/fotos/cover.jpg' }
      });
    });

    it('combina campos y artwork en el mismo patch', () => {
      component.onFieldChange(fieldOf('title'), 'Amnesiac');
      component.onArtChange('fanart', 'http://host/fan.jpg');

      expect(capturePatch()).toEqual({
        title: 'Amnesiac',
        art: { fanart: 'http://host/fan.jpg' }
      });
    });
  });
});
