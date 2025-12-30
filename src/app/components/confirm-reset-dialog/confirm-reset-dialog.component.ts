import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-reset-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Reset all checklists</h2>
    <mat-dialog-content>
      <p>Are you sure you want to reset all the items of the checklists?</p>
      <p class="text-sm text-gray-600">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <div class="mb-2">
        <button mat-button class="h-10!" (click)="onCancel()">Cancel</button>
        <button mat-raised-button class="h-10!" color="primary" (click)="onConfirm()">Reset</button>
      </div>
    </mat-dialog-actions>
  `,
})
export class ConfirmResetDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmResetDialogComponent>);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
