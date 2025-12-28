import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { GoogleAnalyticsService } from './services/google-analytics.service';

function initializeIconRegistry(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
  return () => {
    // Register Material Symbols Outlined as the default icon set
    iconRegistry.registerFontClassAlias('outlined', 'material-symbols-outlined');
    // Optionally, you can also set it as the default font set
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  };
}

function initializeGoogleAnalytics(gaService: GoogleAnalyticsService) {
  return () => {
    // Replace 'G-XXXXXXXXXX' with your actual Google Analytics Measurement ID
    gaService.initialize('G-W1YQR0CBHS');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeIconRegistry,
      deps: [MatIconRegistry, DomSanitizer],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeGoogleAnalytics,
      deps: [GoogleAnalyticsService],
      multi: true,
    },
  ],
};
