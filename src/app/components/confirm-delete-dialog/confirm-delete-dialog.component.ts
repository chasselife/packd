import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>
      Delete {{ data.count && data.count > 1 ? data.count + ' ' : ''
      }}{{ data.isGroup ? 'Checklist Group' : 'Checklist'
      }}{{ data.count && data.count > 1 ? 's' : '' }}
    </h2>
    <mat-dialog-content>
      <p>
        Are you sure you want to delete
        {{
          data.count && data.count > 1 ? 'these ' + data.count + ' items' : '"' + data.title + '"'
        }}?
      </p>
      <p class="text-sm text-gray-600">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <div class="mb-4 mr-4">
        <button mat-button class="h-10!" (click)="onCancel()">Cancel</button>
        <button mat-raised-button class="h-10!" color="warn" (click)="onConfirm()">Delete</button>
      </div>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDeleteDialogComponent>);
  data = inject<{ title: string; isGroup: boolean; count?: number }>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
