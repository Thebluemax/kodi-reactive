import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileHoverDirective } from '../directives/tile-hover.directive';
import { ArrayToStringPipe } from './pipes/array-to-string.pipe';
import { AssetsPipe } from './pipes/assets.pipe';
import { ScapeStringPipe } from './pipes/scape-string.pipe';
import { SecondsToStringPipe } from './pipes/seconds-to-string.pipe';
import { ZeroPaddingPipe } from './pipes/zero-padding.pipe';
import { LateralSlideComponent } from './components/lateral-slide/lateral-slide.component';
import { SquareItemComponent } from './components/square-item/square-item.component';

const COMPONENTS = [LateralSlideComponent, SquareItemComponent];

const DIRECTIVES = [TileHoverDirective];

const PIPES = [
  ArrayToStringPipe,
  AssetsPipe,
  ScapeStringPipe,
  SecondsToStringPipe,
  ZeroPaddingPipe,
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
  exports: [CommonModule, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
})
export class SharedModule {}
