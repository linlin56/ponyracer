import { bootstrapApplication } from '@angular/platform-browser';
import moment from 'moment';
import 'moment/locale/fr';
import { App } from './app/app';
import { appConfig } from './app/app.config';

moment.locale('fr');

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
