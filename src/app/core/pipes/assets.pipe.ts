import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'assets',
  standalone: true
})
export class AssetsPipe implements PipeTransform {
  base = 'http://192.168.0.178:8080/image/image%3A%2F%2Fmusic%40%252f';

  transform(value: string | undefined, ...args: unknown[]): string {
    if(!value) return '';
    const isHttp = value.includes('http');
    value = value.replace(/image:\/\//g, '');
    if(isHttp) {
      value = value.replace(/%3a/g, ':');
      value = value.replace(/%2f/g, '/');
      value = value.substring(0, value.length - 1);
    } else {
      value = value.replace(/music@%2f/g, '');      
      value = value.replace(/%3a/g, '%3A');
      value = value.replace(/%2f/g, '%252f');
    }
    return `${isHttp ? '' : this.base}${value}`;
  }

}
