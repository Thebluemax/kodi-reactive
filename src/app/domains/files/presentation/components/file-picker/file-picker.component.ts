// ==========================================================================
// PRESENTATION - File Picker
// ==========================================================================
// Navega las fuentes que Kodi ya tiene configuradas y devuelve la ruta elegida.
// No monta ningun overlay: se renderiza donde lo pongan, para que quien lo use
// decida como presentarlo.
// ==========================================================================

import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';

import { BrowseFilesUseCase } from '../../../application/use-cases/browse-files.use-case';
import { FileItem, FileMedia } from '../../../domain/entities/file-item.entity';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tbn'];

interface Crumb {
  readonly label: string;
  /** `null` es la raiz, donde se listan las fuentes. */
  readonly path: string | null;
}

@Component({
  selector: 'app-file-picker',
  standalone: true,
  imports: [IonButton, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSpinner],
  templateUrl: './file-picker.component.html',
  styleUrl: './file-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilePickerComponent {
  private readonly browseFiles = inject(BrowseFilesUseCase);

  readonly media = input<FileMedia>(FileMedia.Pictures);
  /** Deja pasar solo carpetas e imagenes, que es lo unico util para artwork. */
  readonly onlyImages = input<boolean>(true);

  readonly selected = output<string>();
  readonly cancelled = output<void>();

  readonly items = signal<FileItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly trail = signal<Crumb[]>([{ label: 'Fuentes', path: null }]);

  /** Archivo elegido, a la espera de que se confirme tras verlo. */
  readonly preview = signal<{ item: FileItem; url: string } | null>(null);
  readonly isPreviewLoading = signal<boolean>(false);

  readonly currentLabel = computed(() => this.trail()[this.trail().length - 1].label);
  readonly canGoBack = computed(() => this.trail().length > 1);
  readonly isEmpty = computed(
    () => !this.isLoading() && this.error().length === 0 && this.items().length === 0
  );

  constructor() {
    this.loadSources();
  }

  onOpen(item: FileItem): void {
    if (item.isDirectory) {
      this.trail.update(trail => [...trail, { label: item.label, path: item.path }]);
      this.loadDirectory(item.path);
      return;
    }

    this.loadPreview(item);
  }

  onBack(): void {
    if (!this.canGoBack()) {
      return;
    }

    this.preview.set(null);
    this.trail.update(trail => trail.slice(0, -1));

    const target = this.trail()[this.trail().length - 1].path;
    if (target === null) {
      this.loadSources();
    } else {
      this.loadDirectory(target);
    }
  }

  onConfirm(): void {
    const chosen = this.preview();

    if (chosen) {
      // Se devuelve la ruta de Kodi, no la URL de descarga: la de descarga es
      // una direccion temporal para mirar, la que se guarda es la del archivo.
      this.selected.emit(chosen.item.path);
    }
  }

  onDiscardPreview(): void {
    this.preview.set(null);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private loadSources(): void {
    this.startLoading();

    this.browseFiles.sources(this.media()).subscribe({
      next: items => this.finishLoading(items),
      error: (err: Error) => this.fail(err)
    });
  }

  private loadDirectory(path: string): void {
    this.startLoading();

    this.browseFiles.directory(path, this.media()).subscribe({
      next: items => this.finishLoading(items),
      error: (err: Error) => this.fail(err)
    });
  }

  private loadPreview(item: FileItem): void {
    this.isPreviewLoading.set(true);
    this.error.set('');

    this.browseFiles.downloadUrl(item.path).subscribe({
      next: url => {
        this.isPreviewLoading.set(false);
        this.preview.set({ item, url });
      },
      error: (err: Error) => {
        this.isPreviewLoading.set(false);
        this.error.set(err.message);
      }
    });
  }

  private startLoading(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.preview.set(null);
  }

  private finishLoading(items: FileItem[]): void {
    this.isLoading.set(false);
    this.items.set(this.onlyImages() ? items.filter(item => this.isUsable(item)) : items);
  }

  private fail(error: Error): void {
    this.isLoading.set(false);
    this.items.set([]);
    this.error.set(error.message);
  }

  private isUsable(item: FileItem): boolean {
    if (item.isDirectory) {
      return true;
    }

    if (item.mimeType.startsWith('image/')) {
      return true;
    }

    const path = item.path.toLowerCase();
    return IMAGE_EXTENSIONS.some(extension => path.endsWith(extension));
  }
}
