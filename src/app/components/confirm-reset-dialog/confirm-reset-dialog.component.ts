import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-reset-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Reset all {{ data.isGroup ? 'checklists' : 'items' }}</h2>
    <mat-dialog-content>
      <p>
        Are you sure you want to reset all the items
        {{ data.isGroup ? 'of the checklists' : 'of the checklist' }}?
      </p>
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
  data = inject<{ isGroup: boolean }>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
