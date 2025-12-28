import { ChangeDetectorRef, Component, OnInit, inject, isDevMode } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import {
  trigger,
  transition,
  style,
  query,
  animateChild,
  group,
  animate,
} from '@angular/animations';
import { UpdateAvailableDialogComponent } from './components/update-available-dialog/update-available-dialog.component';
import { SeedDataService } from './services/seed-data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [
    trigger('routeAnimations', [
      // Forward navigation: slide from right to left (list -> detail)
      transition('list => detail', [
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
      // Backward navigation: slide from left to right (detail -> list)
      transition('detail => list', [
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
      // Default transition for other routes
      transition('* <=> *', [
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
  routeAnimationState: 'list' | 'detail' | 'other' = 'list';
  private previousUrl = '';

  private getRouteType(url: string): 'list' | 'detail' | 'other' {
    if (url === '' || url === '/') {
      return 'list';
    }
    if (url.startsWith('/checklist/')) {
      return 'detail';
    }
    return 'other';
  }

  async ngOnInit() {
    // Track route changes for animation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;
        const currentType = this.getRouteType(currentUrl);

        // Update state - Angular will automatically match the transition
        this.routeAnimationState = currentType;
        this.previousUrl = currentUrl;
      });

    // Set initial route state
    const initialUrl = this.router.url;
    this.previousUrl = initialUrl;
    this.routeAnimationState = this.getRouteType(initialUrl);
    if (!isDevMode() && this.swUpdate.isEnabled) {
      // Check for updates
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.showUpdateDialog();
        });
    }
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
