// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { routes } from './app/app.routes'; // <— importa le tue rotte

registerLocaleData(localeIt);

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),          // <— NON [] vuoto!
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'it' }
  ]
});
