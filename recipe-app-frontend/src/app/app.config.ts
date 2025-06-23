import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Import HttpClient provider

import { routes } from './app.routes'; // Import your application routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), // Provide your application routes
    provideHttpClient() // Provide HttpClient for making API calls
  ]
};
