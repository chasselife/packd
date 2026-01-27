import {
  animate,
  animateChild,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, isDevMode } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { InstallPromptDialogComponent } from './chckd/components/install-prompt-dialog/install-prompt-dialog.component';
import { UpdateAvailableDialogComponent } from './chckd/components/update-available-dialog/update-available-dialog.component';
import { LocalStorageWarning } from './core/components/local-storage-warning/local-storage-warning';
import { PwaInstallService } from './core/services/pwa-install.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatDialogModule, CommonModule, LocalStorageWarning],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('routeAnimations', [
      // Forward navigation: slide from right to left
      transition('forward => forward', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
            }),
          ],
          { optional: true }
        ),
        query(':enter', [style({ transform: 'translateX(100%)' })], { optional: true }),
        query(':leave', animateChild(), { optional: true }),
        group([
          query(':leave', [animate('200ms ease-out', style({ transform: 'translateX(-100%)' }))], {
            optional: true,
          }),
          query(':enter', [animate('200ms ease-in', style({ transform: 'translateX(0%)' }))], {
            optional: true,
          }),
        ]),
        query(':enter', animateChild(), { optional: true }),
      ]),
      // Backward navigation: slide from left to right
      transition('back => back', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
            }),
          ],
          { optional: true }
        ),
        query(':enter', [style({ transform: 'translateX(-100%)' })], { optional: true }),
        query(':leave', animateChild(), { optional: true }),
        group([
          query(':leave', [animate('200ms ease-out', style({ transform: 'translateX(100%)' }))], {
            optional: true,
          }),
          query(':enter', [animate('200ms ease-in', style({ transform: 'translateX(0%)' }))], {
            optional: true,
          }),
        ]),
        query(':enter', animateChild(), { optional: true }),
      ]),
      // State changes (forward to back or back to forward)
      transition('forward => back', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
            }),
          ],
          { optional: true }
        ),
        query(':enter', [style({ transform: 'translateX(-100%)' })], { optional: true }),
        query(':leave', animateChild(), { optional: true }),
        group([
          query(':leave', [animate('200ms ease-out', style({ transform: 'translateX(100%)' }))], {
            optional: true,
          }),
          query(':enter', [animate('200ms ease-in', style({ transform: 'translateX(0%)' }))], {
            optional: true,
          }),
        ]),
        query(':enter', animateChild(), { optional: true }),
      ]),
      transition('back => forward', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
            }),
          ],
          { optional: true }
        ),
        query(':enter', [style({ transform: 'translateX(100%)' })], { optional: true }),
        query(':leave', animateChild(), { optional: true }),
        group([
          query(':leave', [animate('200ms ease-out', style({ transform: 'translateX(-100%)' }))], {
            optional: true,
          }),
          query(':enter', [animate('200ms ease-in', style({ transform: 'translateX(0%)' }))], {
            optional: true,
          }),
        ]),
        query(':enter', animateChild(), { optional: true }),
      ]),
    ]),
  ],
})
export class App implements OnInit {
  private swUpdate = inject(SwUpdate);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  private pwaInstallService = inject(PwaInstallService);
  routeAnimationState: 'forward' | 'back' = 'forward';
  private urlHistory: string[] = [];
  private isBackNavigation = false;

  private installPromptShown = false;

  async ngOnInit() {
    // Listen to NavigationStart to detect back navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        const currentUrl = this.router.url;
        const targetUrl = event.url;

        // Check if we're navigating to a URL that was previously visited (back navigation)
        // Back navigation occurs when the target URL exists in our history
        // and it's not the last item (which would indicate forward navigation to a new page)
        const targetIndex = this.urlHistory.indexOf(targetUrl);
        const lastIndex = this.urlHistory.length - 1;

        // It's a back navigation if:
        // 1. Target URL is in history
        // 2. It's not the last item (forward navigation would add a new item)
        // 3. It's different from current URL (not staying on same page)
        this.isBackNavigation =
          targetIndex >= 0 && targetIndex < lastIndex && targetUrl !== currentUrl;
      });

    // Track route changes for animation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;

        // Update animation state based on navigation direction
        this.routeAnimationState = this.isBackNavigation ? 'back' : 'forward';

        // Update URL history
        // Remove the URL and everything after it if we're going back
        if (this.isBackNavigation) {
          const targetIndex = this.urlHistory.indexOf(currentUrl);
          if (targetIndex >= 0) {
            this.urlHistory = this.urlHistory.slice(0, targetIndex + 1);
          }
        } else {
          // Forward navigation - add to history
          // Remove current URL if it exists (to avoid duplicates)
          this.urlHistory = this.urlHistory.filter((url) => url !== currentUrl);
          this.urlHistory.push(currentUrl);
        }

        // Reset flag for next navigation
        this.isBackNavigation = false;
      });

    // Set initial route state
    const initialUrl = this.router.url;
    this.urlHistory = [initialUrl];
    this.routeAnimationState = 'forward';
    if (!isDevMode() && this.swUpdate.isEnabled) {
      // Check for updates
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.showUpdateDialog();
        });
    }

    // Show PWA install prompt on initial load
    this.checkAndShowInstallPrompt();
  }

  private checkAndShowInstallPrompt(): void {
    // Don't show if already installed
    if (this.pwaInstallService.isInstalled()) {
      return;
    }

    // Subscribe to install prompt availability
    this.pwaInstallService.installPromptAvailable
      .pipe(filter((available) => available && !this.installPromptShown))
      .subscribe(() => {
        // Wait a bit for the app to fully load before showing prompt
        setTimeout(() => {
          if (this.pwaInstallService.canShowPrompt && !this.installPromptShown) {
            this.showInstallPromptDialog();
          }
        }, 2000);
      });

    // Also check immediately in case the event already fired
    setTimeout(() => {
      if (this.pwaInstallService.canShowPrompt && !this.installPromptShown) {
        this.showInstallPromptDialog();
      }
    }, 2000); // Wait 2 seconds after initial load
  }

  private showInstallPromptDialog(): void {
    if (this.installPromptShown) {
      return; // Prevent showing multiple times
    }

    this.installPromptShown = true;
    const dialogRef = this.dialog.open(InstallPromptDialogComponent, {
      disableClose: false,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(() => {
      // Dialog closed, user either installed or dismissed
    });
  }

  private showUpdateDialog(): void {
    const dialogRef = this.dialog.open(UpdateAvailableDialogComponent, {
      disableClose: true,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.swUpdate.activateUpdate().then(() => {
          window.location.reload();
        });
      }
    });
  }
}
