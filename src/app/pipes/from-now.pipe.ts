import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'fromNow',
  standalone: true,
})
// pipe pour afficher une date relative en français
export class FromNowPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const start = moment(value);
    const diffInSeconds = start.diff(moment(), 'seconds');

    if (diffInSeconds > 0 && diffInSeconds < 60) {
      return `dans ${diffInSeconds} secondes`;
    }

    return start.fromNow();
  }
}
