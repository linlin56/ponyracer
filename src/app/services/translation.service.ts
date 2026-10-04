import { effect, Injectable, signal } from '@angular/core';
import moment from 'moment';
import { Lang, TranslationKey, translations } from '../i18n/translations';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly LANG_KEY = 'ponyracer_lang';
  readonly languages: Lang[] = ['fr', 'en'];
  lang = signal<Lang>(this.getInitialLang());

  constructor() {
    // à chaque changement de langue : sauvegarde, attribut lang du document et locale moment
    effect(() => {
      const lang = this.lang();
      localStorage.setItem(this.LANG_KEY, lang);
      document.documentElement.lang = lang;
      moment.locale(lang);
    });
  }

  // langue sauvegardée, sinon anglais par défaut
  private getInitialLang(): Lang {
    const stored = localStorage.getItem(this.LANG_KEY);
    return stored === 'fr' ? 'fr' : 'en';
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  // renvoie le texte traduit en remplaçant les paramètres {nom}
  t(key: TranslationKey | string, params?: Record<string, string | number>): string {
    const dictionary: Record<string, string> = translations[this.lang()];
    const text = dictionary[key] ?? key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name) =>
      params[name] !== undefined ? String(params[name]) : match,
    );
  }
}
