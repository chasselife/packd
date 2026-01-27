import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PwaInstallService } from '../../../core/services/pwa-install.service';

@Component({
  selector: 'app-install-prompt-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Install Chckd</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-3">
        <p>Install Chckd as an app for a better experience!</p>
        <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Quick access from your home screen</li>
          <li>Works offline</li>
          <li>Faster loading times</li>
        </ul>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <div class="mb-4">
        <button mat-button (click)="onDismiss()">Not Now</button>
        <button mat-raised-button color="primary" (click)="onInstall()">Install</button>
      </div>
    </mat-dialog-actions>
  `,
})
export class InstallPromptDialogComponent {
  dialogRef = inject(MatDialogRef<InstallPromptDialogComponent>);
  private pwaInstallService = inject(PwaInstallService);

  onDismiss(): void {
    this.pwaInstallService.markAsDismissed();
    this.dialogRef.close(false);
  }

  async onInstall(): Promise<void> {
    const installed = await this.pwaInstallService.promptInstall();
    this.dialogRef.close(installed);
  }
}
