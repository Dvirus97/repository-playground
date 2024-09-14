import { Pipe, PipeTransform } from '@angular/core';
import { getAllKeys } from '../Util/getAllKeys';

@Pipe({
  name: 'translate',
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): unknown {
    console.log(args);
    const a = getAllKeys(value);
    console.log(a);
    return a;
  }
}
