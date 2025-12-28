import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { GoogleAnalyticsService } from './services/google-analytics.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideAppInitializer(() => {
      const iconRegistry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);
      // Register Material Symbols Outlined as the default icon set
      iconRegistry.registerFontClassAlias('outlined', 'material-symbols-outlined');
      // Optionally, you can also set it as the default font set
      iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    }),
    provideAppInitializer(() => {
      const gaService = inject(GoogleAnalyticsService);
      // Replace 'G-XXXXXXXXXX' with your actual Google Analytics Measurement ID
      gaService.initialize('G-W1YQR0CBHS');
    }),
  ],
};
