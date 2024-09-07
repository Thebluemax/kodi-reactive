import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zeroPadding',
  standalone: true
})
export class ZeroPaddingPipe implements PipeTransform {

  transform(value: number | undefined, ...args: unknown[]): string {
    let paddingString = '00';
    if(value) 
      paddingString =  value.toString().padStart(2, '0');
    
    return paddingString;
  }

}
