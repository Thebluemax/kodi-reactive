import { NgModule } from '@angular/core';
import { AssetsPipe } from './assets.pipe';
import { ZeroPaddingPipe } from './zero-padding.pipe';
import { ArrayToStringPipe } from './array-to-string.pipe';

@NgModule({
  imports: [ AssetsPipe, ZeroPaddingPipe, ArrayToStringPipe],
  exports: [
    AssetsPipe,
    ZeroPaddingPipe,
    ArrayToStringPipe
  ],
  declarations: []
})
export class PipesModule {}
