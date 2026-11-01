import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { apiErrorInterceptor } from './core/api-error.interceptor';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([apiErrorInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr' },
  ],
};
