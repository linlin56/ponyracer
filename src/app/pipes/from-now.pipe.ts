import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'fromNow',
  standalone: true,
})
export class FromNowPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return moment(value).fromNow();
  }
}
