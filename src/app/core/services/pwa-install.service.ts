import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  private installPromptAvailable$ = new BehaviorSubject<boolean>(false);
  private readonly DISMISSED_KEY = 'pwa-install-dismissed';
  private readonly DISMISSED_TIMESTAMP_KEY = 'pwa-install-dismissed-timestamp';
  private readonly DISMISS_COOLDOWN_DAYS = 7; // Show again after 7 days if dismissed

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupInstallPromptListener();
    }
  }

  private setupInstallPromptListener(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.installPromptEvent = e as BeforeInstallPromptEvent;
      this.installPromptAvailable$.next(true);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.installPromptEvent = null;
      this.installPromptAvailable$.next(false);
      this.clearDismissedState();
    });
  }

  get installPromptAvailable(): Observable<boolean> {
    return this.installPromptAvailable$.asObservable();
  }

  get canShowPrompt(): boolean {
    if (!this.installPromptAvailable$.value) {
      return false;
    }

    // Check if user has dismissed the prompt
    const dismissed = localStorage.getItem(this.DISMISSED_KEY);
    if (!dismissed || dismissed !== 'true') {
      return true;
    }

    // Check if cooldown period has passed
    const dismissedTimestamp = localStorage.getItem(this.DISMISSED_TIMESTAMP_KEY);
    if (dismissedTimestamp) {
      const dismissedDate = new Date(parseInt(dismissedTimestamp, 10));
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceDismissed >= this.DISMISS_COOLDOWN_DAYS;
    }

    return false;
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPromptEvent) {
      return false;
    }

    try {
      this.installPromptEvent.prompt();
      const { outcome } = await this.installPromptEvent.userChoice;

      if (outcome === 'accepted') {
        this.installPromptEvent = null;
        this.installPromptAvailable$.next(false);
        this.clearDismissedState();
        return true;
      } else {
        this.markAsDismissed();
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  markAsDismissed(): void {
    localStorage.setItem(this.DISMISSED_KEY, 'true');
    localStorage.setItem(this.DISMISSED_TIMESTAMP_KEY, Date.now().toString());
  }

  private clearDismissedState(): void {
    localStorage.removeItem(this.DISMISSED_KEY);
    localStorage.removeItem(this.DISMISSED_TIMESTAMP_KEY);
  }

  isInstalled(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check for iOS standalone mode
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    return false;
  }
}

// Type definition for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
