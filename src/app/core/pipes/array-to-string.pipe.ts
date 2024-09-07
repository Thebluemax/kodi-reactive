import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayToString',
  standalone: true
})
export class ArrayToStringPipe implements PipeTransform {

  transform(value: string[] | undefined, ...args: unknown[]): string {
    return value?.join(', ') || '';
  }

}
