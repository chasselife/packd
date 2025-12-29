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

      /* Checklist tile styling - card-like appearance */
      .checklist-tile {
        transform: translateY(0);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .checklist-tile:not(.no-hover):hover {
        transform: translateY(-2px);
      }

      /* Group tile styling - folder-like appearance */
      .group-tile {
        transform: translateY(0) perspective(1000px) rotateX(0deg);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        overflow: visible;
      }

      .group-tile:not(.no-hover):hover {
        transform: translateY(-3px) perspective(1000px) rotateX(2deg);
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3) !important;
      }

      /* Add depth to group tiles */
      .group-tile::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0) 50%,
          rgba(0, 0, 0, 0.05) 100%
        );
        border-radius: inherit;
        pointer-events: none;
        z-index: 1;
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
  checklistCount = input<number | undefined>(undefined);

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
