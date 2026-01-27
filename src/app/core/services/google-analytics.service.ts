import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  private measurementId: string = 'G-XXXXXXXXXX'; // Replace with your Measurement ID

  constructor(private router: Router) {}

  /**
   * Initialize Google Analytics
   * Call this method once with your Measurement ID
   */
  initialize(measurementId: string): void {
    this.measurementId = measurementId;
    this.trackPageViews();
  }

  /**
   * Track page views automatically on route changes
   */
  private trackPageViews(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Track a page view
   */
  trackPageView(url: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('config', this.measurementId, {
        page_path: url,
      });
    }
  }

  /**
   * Track an event
   */
  trackEvent(
    eventName: string,
    eventCategory?: string,
    eventLabel?: string,
    value?: number
  ): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: eventCategory,
        event_label: eventLabel,
        value: value,
      });
    }
  }

  /**
   * Track a custom event with custom parameters
   */
  trackCustomEvent(eventName: string, parameters?: Record<string, any>): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
  }
}

