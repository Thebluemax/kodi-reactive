import { Pipe, PipeTransform, inject } from '@angular/core';
import { KodiConfigService } from '@shared/services/kodi-config.service';

@Pipe({
  name: 'assets',
  standalone: true
})
export class AssetsPipe implements PipeTransform {
  private readonly kodiConfig = inject(KodiConfigService);

  transform(value: string | undefined): string {
    if (!value) return '';

    // URL HTTP directa (fuente externa, ej: Last.fm) — devolver sin modificar
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value.endsWith('/') ? value.slice(0, -1) : value;
    }

    // URL Kodi (image://...) — encodear y proxiar a través del API de imágenes
    return `${this.kodiConfig.httpBaseUrl}/image/${encodeURIComponent(value)}`;
  }
}
