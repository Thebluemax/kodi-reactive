// ==========================================================================
// SHARED COMPONENT - Media Edit Modal
// ==========================================================================
// Un unico formulario para los cinco medios editables. Cada medio aporta su
// esquema; este componente no sabe de albumes ni de peliculas.
// ==========================================================================

import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AssetsPipe } from '@shared/pipes/assets.pipe';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';

import { MediaArtworkSet } from '@shared/types/media-artwork.type';
import {
  MediaEditField,
  MediaEditPatch,
  MediaEditSchema,
  MediaEditValue
} from '@shared/types/media-edit-schema.type';

/** Separador de las listas de cadenas en la caja de texto. */
const LIST_SEPARATOR = ',';

/**
 * Las cuatro claves que Media.Artwork.Set nombra. El tipo declara ademas
 * additionalProperties, asi que clearlogo, discart o landscape tambien valen y
 * el usuario puede anadirlas.
 */
const KNOWN_ART_KEYS = ['thumb', 'poster', 'fanart', 'banner'] as const;

@Component({
  selector: 'app-media-edit-modal',
  standalone: true,
  imports: [
    FormsModule,
    AssetsPipe,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar
  ],
  templateUrl: './media-edit-modal.component.html',
  styleUrl: './media-edit-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaEditModalComponent {
  readonly title = input<string>('Editar');
  readonly schema = input.required<MediaEditSchema>();
  /**
   * Valores actuales del medio, en el vocabulario del dominio.
   *
   * Tiene que ser una referencia estable: cambiarla repone el borrador y
   * descarta lo tecleado, que es lo que queremos al pasar de un medio a otro.
   * Si el contenedor la construye con un metodo en la plantilla, devolvera un
   * objeto nuevo en cada ciclo de deteccion y el formulario se vaciara solo.
   * Un computed.
   */
  readonly value = input.required<Record<string, MediaEditValue>>();
  readonly saving = input<boolean>(false);
  /**
   * Artwork actual del medio. Misma exigencia de referencia estable que `value`.
   * Ausente oculta la seccion, para los medios que no la tengan.
   */
  readonly artwork = input<MediaArtworkSet | null>(null);

  /** Solo los campos que el usuario cambio. */
  readonly save = output<MediaEditPatch>();
  readonly cancelled = output<void>();

  /** Estado del formulario, indexado por clave del esquema. */
  private readonly draft = signal<Record<string, MediaEditValue>>({});

  /** Estado del artwork, indexado por clave de arte. `null` marca borrado. */
  private readonly artDraft = signal<Record<string, string | null>>({});
  /** Claves cuya URL el navegador no ha conseguido cargar. */
  private readonly brokenArt = signal<Set<string>>(new Set());
  readonly newArtKey = signal<string>('');

  constructor() {
    // Reabrir el modal sobre otro medio tiene que descartar lo tecleado antes.
    effect(() => {
      this.draft.set(this.toDraft(this.schema(), this.value()));
    });

    effect(() => {
      this.artDraft.set(this.toArtDraft(this.artwork()));
      this.brokenArt.set(new Set());
      this.newArtKey.set('');
    });
  }

  readonly hasArtwork = computed(() => this.artwork() !== null);

  /** Las conocidas primero, y despues las que el medio o el usuario anadieron. */
  readonly artKeys = computed(() => {
    const present = Object.keys(this.artDraft());
    const extra = present.filter(key => !KNOWN_ART_KEYS.includes(key as never)).sort();

    return [...KNOWN_ART_KEYS, ...extra];
  });

  readonly isDirty = computed(() => Object.keys(this.buildPatch()).length > 0);

  artValue(key: string): string {
    return this.artDraft()[key] ?? '';
  }

  isArtBroken(key: string): boolean {
    return this.brokenArt().has(key);
  }

  onArtChange(key: string, raw: unknown): void {
    const url = String(raw ?? '').trim();

    this.artDraft.update(current => ({
      ...current,
      // Vaciar la caja borra ese artwork: null es como se quita en la API.
      [key]: url.length > 0 ? url : null
    }));
    this.clearBroken(key);
  }

  onArtLoadError(key: string): void {
    this.brokenArt.update(current => new Set(current).add(key));
  }

  onArtLoaded(key: string): void {
    this.clearBroken(key);
  }

  onAddArtKey(): void {
    const key = this.newArtKey().trim().toLowerCase();

    if (key.length === 0 || key in this.artDraft()) {
      return;
    }

    this.artDraft.update(current => ({ ...current, [key]: null }));
    this.newArtKey.set('');
  }

  private clearBroken(key: string): void {
    this.brokenArt.update(current => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }

  private toArtDraft(artwork: MediaArtworkSet | null): Record<string, string | null> {
    const draft: Record<string, string | null> = {};

    for (const key of KNOWN_ART_KEYS) {
      draft[key] = artwork?.[key] ?? null;
    }

    for (const [key, value] of Object.entries(artwork ?? {})) {
      draft[key] = value ?? null;
    }

    return draft;
  }

  /** Solo las claves de arte que cambiaron respecto a lo que el medio tenia. */
  private buildArtPatch(): MediaArtworkSet | null {
    const original = this.toArtDraft(this.artwork());
    const draft = this.artDraft();
    const patch: Record<string, string | null> = {};

    for (const key of Object.keys(draft)) {
      const before = original[key] ?? null;
      const after = draft[key] ?? null;

      if (before !== after) {
        patch[key] = after;
      }
    }

    return Object.keys(patch).length > 0 ? patch : null;
  }

  fieldValue(field: MediaEditField): MediaEditValue {
    return this.draft()[field.key];
  }

  onFieldChange(field: MediaEditField, raw: unknown): void {
    this.draft.update(current => ({
      ...current,
      [field.key]: this.parse(field, raw)
    }));
  }

  onSave(): void {
    const patch = this.buildPatch();

    if (Object.keys(patch).length === 0) {
      this.cancelled.emit();
      return;
    }

    this.save.emit(patch);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  /**
   * Compara el borrador con los valores de partida y devuelve solo lo que
   * cambio. Un campo intacto no viaja, que es como se le dice a Kodi que no lo
   * toque.
   */
  private buildPatch(): MediaEditPatch {
    const original = this.toDraft(this.schema(), this.value());
    const draft = this.draft();
    const patch: MediaEditPatch = {};

    for (const field of this.schema()) {
      const before = original[field.key];
      const after = draft[field.key];

      if (this.areEqual(before, after)) {
        continue;
      }

      // Vaciar un numero no es borrarlo: los parametros numericos de la API son
      // Optional.Integer y Optional.Number, sin null entre sus tipos, asi que no
      // hay forma de expresar "quitale el año". Se trata como si no se hubiera
      // tocado, en vez de mandar una cadena vacia a un entero.
      if (field.kind === 'number' && after === '') {
        continue;
      }

      patch[field.key] = after;
    }

    const art = this.buildArtPatch();
    if (art) {
      patch['art'] = art;
    }

    return patch;
  }

  private toDraft(
    schema: MediaEditSchema,
    value: Record<string, MediaEditValue>
  ): Record<string, MediaEditValue> {
    const draft: Record<string, MediaEditValue> = {};

    for (const field of schema) {
      draft[field.key] = this.normalize(field, value[field.key]);
    }

    return draft;
  }

  /** Deja cada campo en la forma que el formulario maneja. */
  private normalize(field: MediaEditField, raw: MediaEditValue): MediaEditValue {
    if (field.kind === 'string-list') {
      return Array.isArray(raw) ? [...raw] : [];
    }

    if (field.kind === 'boolean') {
      return raw === true;
    }

    return raw ?? '';
  }

  private parse(field: MediaEditField, raw: unknown): MediaEditValue {
    if (field.kind === 'string-list') {
      const text = String(raw ?? '');
      return text
        .split(LIST_SEPARATOR)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }

    if (field.kind === 'boolean') {
      return raw === true;
    }

    if (field.kind === 'number') {
      const text = String(raw ?? '').trim();
      if (text.length === 0) {
        return '';
      }
      const parsed = Number(text);
      return isNaN(parsed) ? '' : parsed;
    }

    return String(raw ?? '');
  }

  /** Texto que se muestra en la caja de una lista de cadenas. */
  listAsText(field: MediaEditField): string {
    const value = this.draft()[field.key];
    return Array.isArray(value) ? value.join(`${LIST_SEPARATOR} `) : '';
  }

  private areEqual(a: MediaEditValue, b: MediaEditValue): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((item, i) => item === b[i]);
    }

    return a === b;
  }
}
