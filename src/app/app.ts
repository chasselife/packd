import { ChangeDetectorRef, Component, OnInit, inject, isDevMode } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { UpdateAvailableDialogComponent } from './components/update-available-dialog/update-available-dialog.component';
import { SeedDataService } from './services/seed-data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private swUpdate = inject(SwUpdate);
  private dialog = inject(MatDialog);

  async ngOnInit() {
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
