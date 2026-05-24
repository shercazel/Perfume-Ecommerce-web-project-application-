import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pcs'
})
export class PcsPipe implements PipeTransform {
  transform(value: number): string {
    return `${value} pcs`;
  }
}