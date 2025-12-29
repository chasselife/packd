import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Checklist } from '../../models/checklist.model';
import { ChecklistGroup } from '../../models/checklist-group.model';

export type TileItem = Checklist | ChecklistGroup;

export interface ColorClasses {
  bgClass: string;
  borderClass: string;
  textClass: string;
}

@Component({
  selector: 'app-checklist-tile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, DragDropModule],
  templateUrl: './checklist-tile.component.html',
  styles: [
    `
      @keyframes wiggle {
        0%,
        100% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(-0.75deg);
        }
        50% {
          transform: rotate(0.75deg);
        }
        75% {
          transform: rotate(-0.5deg);
        }
      }

      .wiggle-animation:not(.cdk-drag-preview) {
        animation: wiggle 0.5s ease-in-out infinite;
      }
      :host {
        display: flex;
      }
    `,
  ],
})
export class ChecklistTileComponent {
  // Inputs
  item = input.required<TileItem>();
  isEditMode = input.required<boolean>();
  colorClasses = input.required<ColorClasses>();
  showDuplicateButton = input<boolean>(false);
  showBorder = input<boolean>(false);
  defaultIcon = input<string>('checklist');

  // Outputs
  clicked = output<TileItem>();
  editClicked = output<{ item: TileItem; event: Event }>();
  deleteClicked = output<{ item: TileItem; event: Event }>();
  duplicateClicked = output<{ item: TileItem; event: Event }>();
  mouseDown = output<{ item: TileItem; event: MouseEvent | TouchEvent }>();
  mouseUp = output<MouseEvent | TouchEvent>();
  mouseLeave = output<void>();
  touchMove = output<TouchEvent>();
  touchEnd = output<{ item: TileItem; event: TouchEvent; isGroup: boolean }>();

  get itemTitle(): string {
    return this.item().title;
  }

  get itemIcon(): string {
    return this.item().icon || this.defaultIcon();
  }

  get itemColor(): string | undefined {
    return this.item().color;
  }

  isChecklist = input<boolean>(true);

  onTileClick(): void {
    if (!this.isEditMode()) {
      this.clicked.emit(this.item());
    }
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClicked.emit({ item: this.item(), event });
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClicked.emit({ item: this.item(), event });
  }

  onDuplicateClick(event: Event): void {
    event.stopPropagation();
    this.duplicateClicked.emit({ item: this.item(), event });
  }

  onMouseDown(event: MouseEvent | TouchEvent): void {
    // Don't interfere with drag and drop when in edit mode
    if (this.isEditMode()) {
      return;
    }
    this.mouseDown.emit({ item: this.item(), event });
  }

  onMouseUp(event: MouseEvent | TouchEvent): void {
    // Don't interfere with drag and drop when in edit mode
    if (this.isEditMode()) {
      return;
    }
    this.mouseUp.emit(event);
  }

  onMouseLeave(): void {
    // Don't interfere with drag and drop when in edit mode
    if (this.isEditMode()) {
      return;
    }
    this.mouseLeave.emit();
  }

  onTouchMove(event: TouchEvent): void {
    // Don't interfere with drag and drop when in edit mode
    if (this.isEditMode()) {
      return;
    }
    this.touchMove.emit(event);
  }

  onTouchEnd(event: TouchEvent): void {
    // Don't interfere with drag and drop when in edit mode
    if (this.isEditMode()) {
      return;
    }
    this.touchEnd.emit({ item: this.item(), event, isGroup: !this.isChecklist() });
  }
}
