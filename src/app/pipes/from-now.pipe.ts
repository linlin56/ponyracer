import { inject, Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'fromNow',
  standalone: true,
  // impur pour se mettre à jour quand la langue change
  pure: false,
})
// pipe pour afficher une date relative dans la langue choisie
export class FromNowPipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: string): string {
    if (!value) return '';
    const start = moment(value).locale(this.translationService.lang());
    const diffInSeconds = start.diff(moment(), 'seconds');

    if (diffInSeconds > 0 && diffInSeconds < 60) {
      return this.translationService.t('fromNow.inSeconds', { seconds: diffInSeconds });
    }

    return start.fromNow();
  }
}
