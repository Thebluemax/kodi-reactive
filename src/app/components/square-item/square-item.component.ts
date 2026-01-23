import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TileHoverDirective } from '../../directives/tile-hover.directive';
import { NgIf, NgClass } from '@angular/common';
import { AssetsPipe } from '../../core/pipes/assets.pipe';

@Component({
    selector: 'app-square-item',
    templateUrl: './square-item.component.html',
    styleUrls: ['./square-item.component.scss'],
    imports: [IonicModule, TileHoverDirective, NgIf, NgClass, AssetsPipe]
})
export class SquareItemComponent {
  @Input() headerActive: boolean = false;
  @Input() ShowFavButtons: boolean = true;
  @Input() hoverActive: boolean = true;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() thumbnail: string = '';
  @Input() item: any = null;
  @Output() sendToPlaylist = new EventEmitter<{} | null>();
  @Output() sendItem = new EventEmitter<any | null>();

  constructor() {}
  getItem(item: any | null) {
    this.sendItem.emit(item);
  }
  emitToPlaylist(item: any | null, playMedia: boolean) {
    this.sendToPlaylist.emit({ media: item, playMedia: playMedia });
  }
  getItemType(item: any) {
    if (item && item.type) {
      return item.type;
    }
    return null;
  }
}
