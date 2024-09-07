import { NgModule } from '@angular/core';
import { TileHoverDirective } from './tile-hover.directive';



@NgModule({
  imports: [
    TileHoverDirective
  ],
  exports: [
    TileHoverDirective
  ]
})
export class DirectivesModule {}
