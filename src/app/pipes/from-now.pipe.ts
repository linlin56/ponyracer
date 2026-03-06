import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'fromNow',
  standalone: true,
})
// pipe pour afficher une date au format "il y a X temps"
export class FromNowPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return moment(value).fromNow();
  }
}
