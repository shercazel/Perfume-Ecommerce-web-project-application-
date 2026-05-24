import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pcs',
})
export class PcsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
