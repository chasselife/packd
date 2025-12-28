import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update-available-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Update Available</h2>
    <mat-dialog-content>
      <p>A new version of the app is available.</p>
      <p class="text-sm text-gray-600">Would you like to update now?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <div class="mb-4 mr-4">
        <button mat-button (click)="onCancel()">Later</button>
        <button mat-raised-button color="primary" (click)="onConfirm()">Update Now</button>
      </div>
    </mat-dialog-actions>
  `,
})
export class UpdateAvailableDialogComponent {
  dialogRef = inject(MatDialogRef<UpdateAvailableDialogComponent>);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
