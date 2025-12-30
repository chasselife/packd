import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DatabaseService } from '../../services/database.service';
import { getColorClasses } from '../../constants/color-options.constant';
import { Checklist, ChecklistItem } from '../../models/checklist.model';
import { ChecklistGroup } from '../../models/checklist-group.model';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { FooterComponent } from '../footer/footer.component';
import { ChecklistTileComponent } from '../checklist-tile/checklist-tile.component';
import { ConfirmResetDialogComponent } from '../confirm-reset-dialog/confirm-reset-dialog.component';

@Component({
  selector: 'app-checklist-group-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    RouterModule,
    DragDropModule,
    FooterComponent,
    ChecklistTileComponent,
  ],
  templateUrl: './checklist-group-list.component.html',
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

      .wiggle-animation:nth-child(3n + 1):not(.cdk-drag-preview) {
        animation-delay: 0s;
      }

      .wiggle-animation:nth-child(3n + 2):not(.cdk-drag-preview) {
        animation-delay: 0.1s;
      }

      .wiggle-animation:nth-child(3n + 3):not(.cdk-drag-preview) {
        animation-delay: 0.2s;
      }

      @keyframes slideDownFadeIn {
        0% {
          opacity: 0;
          transform: translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .exit-edit-button {
        animation: slideDownFadeIn 0.2s ease-out;
      }
    `,
  ],
})
export class ChecklistGroupListComponent implements OnInit, OnDestroy, AfterViewInit {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private location = inject(Location);

  checklists = signal<Checklist[]>([]);
  checklistGroup = signal<ChecklistGroup | null>(null);
  isLoading = signal(true);
  isEditMode = signal(false);
  isSelectMode = signal(false);
  groupId: number | null = null;
  selectedChecklistIds = signal<Set<number>>(new Set());
  isDescriptionExpanded = signal(false);
  isDescriptionTruncated = signal(false);

  @ViewChild('descriptionElement', { static: false })
  descriptionElement?: ElementRef<HTMLParagraphElement>;

  private longPressTimer: number | null = null;
  private readonly LONG_PRESS_DURATION = 500; // milliseconds
  private editModeJustActivated = false;
  private routerSubscription?: Subscription;

  // Touch tracking for mobile scroll detection
  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;

  async ngOnInit(): Promise<void> {
    const groupIdParam = this.route.snapshot.paramMap.get('id');
    if (groupIdParam) {
      this.groupId = Number(groupIdParam);
      await this.loadGroup();
      await this.loadChecklists();
    } else {
      this.router.navigate(['/']);
    }

    // Reload checklists when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentGroupId = this.route.snapshot.paramMap.get('id');
        if (currentGroupId && Number(currentGroupId) === this.groupId) {
          this.loadChecklists();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onGroupEditClick() {
    if (this.groupId) {
      this.router.navigate(['/checklist-group', this.groupId, 'edit']);
    }
  }

  async loadGroup(): Promise<void> {
    if (!this.groupId) return;
    try {
      const group = await this.databaseService.getChecklistGroup(this.groupId);
      if (group) {
        this.checklistGroup.set(group);
        // Reset expanded state when loading a new group
        this.isDescriptionExpanded.set(false);
        // Check if description is truncated after view updates
        setTimeout(() => this.checkDescriptionTruncation(), 100);
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error loading checklist group:', error);
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit(): void {
    // Check if description is truncated after view initialization
    setTimeout(() => this.checkDescriptionTruncation(), 100);
  }

  checkDescriptionTruncation(): void {
    if (!this.descriptionElement?.nativeElement) return;
    const element = this.descriptionElement.nativeElement;

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      // Temporarily remove line-clamp to measure full height
      const hasLineClamp = element.classList.contains('line-clamp-3');
      if (hasLineClamp) {
        element.classList.remove('line-clamp-3');
      }

      // Force a reflow to get accurate measurements
      void element.offsetHeight;

      const fullHeight = element.scrollHeight;

      if (hasLineClamp) {
        element.classList.add('line-clamp-3');
      }

      // Force another reflow
      void element.offsetHeight;

      const clampedHeight = element.clientHeight;
      this.isDescriptionTruncated.set(fullHeight > clampedHeight);
    });
  }

  async loadChecklists(): Promise<void> {
    if (!this.groupId) return;
    try {
      this.isLoading.set(true);
      const groupChecklists = await this.databaseService.getChecklistsByGroupId(this.groupId);
      this.checklists.set(groupChecklists);
    } catch (error) {
      console.error('Error loading checklists:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }

  onChecklistClick(checklist: Checklist): void {
    if (checklist.id) {
      this.router.navigate(['/checklist', checklist.id]);
    }
  }

  openNewChecklistDialog(): void {
    if (this.groupId) {
      this.router.navigate(['/checklist/new'], {
        queryParams: { groupId: this.groupId },
      });
    } else {
      this.router.navigate(['/checklist/new']);
    }
  }

  onTileMouseDown(checklist: Checklist, event: MouseEvent | TouchEvent): void {
    if (this.isEditMode() || this.isSelectMode()) {
      return; // Don't trigger long press in edit mode or select mode
    }

    // Track touch start position for mobile scroll detection
    if (event instanceof TouchEvent && event.touches && event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.touchMoved = false;
    }

    event.stopPropagation();

    this.longPressTimer = window.setTimeout(() => {
      this.activateEditMode();
      this.editModeJustActivated = true;
      this.longPressTimer = null;
    }, this.LONG_PRESS_DURATION);
  }

  onTileTouchMove(event: TouchEvent): void {
    if (this.isEditMode() || this.isSelectMode()) {
      return;
    }

    if (!event.touches || event.touches.length === 0) return;

    const deltaX = Math.abs(event.touches[0].clientX - this.touchStartX);
    const deltaY = Math.abs(event.touches[0].clientY - this.touchStartY);

    if (deltaX > 10 || deltaY > 10) {
      this.touchMoved = true;
      if (this.longPressTimer !== null) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
  }

  onTileMouseUp(event: MouseEvent | TouchEvent): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    setTimeout(() => {
      this.editModeJustActivated = false;
    }, this.LONG_PRESS_DURATION);
    event.stopPropagation();
  }

  onTileTouchEnd(checklist: Checklist, event: TouchEvent, isGroup: boolean): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (!this.touchMoved && !this.isEditMode() && !this.isSelectMode()) {
      // In this component, all tiles are checklists (not groups)
      this.onChecklistClick(checklist);
    }

    this.touchMoved = false;
    this.touchStartX = 0;
    this.touchStartY = 0;

    event.stopPropagation();
  }

  onTileMouseLeave(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    setTimeout(() => {
      this.editModeJustActivated = false;
    }, this.LONG_PRESS_DURATION);
  }

  activateEditMode(): void {
    this.isEditMode.set(true);
    this.isSelectMode.set(false);
    this.selectedChecklistIds.set(new Set());
  }

  deactivateEditMode(): void {
    this.isEditMode.set(false);
    this.selectedChecklistIds.set(new Set());
  }

  activateSelectMode(): void {
    this.isSelectMode.set(true);
    this.isEditMode.set(false);
    this.selectedChecklistIds.set(new Set());
  }

  deactivateSelectMode(): void {
    this.isSelectMode.set(false);
    this.selectedChecklistIds.set(new Set());
  }

  onEditClick(checklist: Checklist, event: Event): void {
    event.stopPropagation();
    this.openEditChecklistDialog(checklist);
  }

  onDeleteClick(checklist: Checklist, event: Event): void {
    event.stopPropagation();
    this.openDeleteChecklistDialog(checklist);
  }

  async onDuplicateClick(checklist: Checklist, event: Event): Promise<void> {
    event.stopPropagation();
    if (!checklist.id || !this.groupId) return;

    try {
      // Get the original checklist to ensure we have all data
      const originalChecklist = await this.databaseService.getChecklist(checklist.id);
      if (!originalChecklist || !originalChecklist.id) return;

      // Create duplicate checklist with "Copy" appended to title
      const newChecklistId = await this.databaseService.createChecklist({
        title: `${originalChecklist.title} Copy`,
        icon: originalChecklist.icon,
        color: originalChecklist.color,
        groupId: this.groupId, // Ensure it stays in the same group
      });

      if (!newChecklistId) return;

      // Get all checklists in the group to calculate sortOrder
      const relevantChecklists = await this.databaseService.getChecklistsByGroupId(this.groupId);

      // Find the original checklist's sortOrder
      const originalSortOrder = originalChecklist.sortOrder;

      // Update the duplicate's sortOrder to be right after the original
      await this.databaseService.updateChecklist(newChecklistId, {
        sortOrder: originalSortOrder + 1,
      });

      // Shift all checklists after the original by 1 to make room
      const checklistsToShift = relevantChecklists.filter(
        (c) =>
          c.sortOrder > originalSortOrder &&
          c.id !== newChecklistId &&
          c.id !== originalChecklist.id
      );

      for (const c of checklistsToShift) {
        if (c.id) {
          await this.databaseService.updateChecklist(c.id, {
            sortOrder: c.sortOrder + 1,
          });
        }
      }

      // Get items from the original checklist and duplicate them
      const items = await this.databaseService.getChecklistItems(originalChecklist.id);
      if (items.length > 0) {
        for (const item of items) {
          await this.databaseService.createChecklistItem({
            checklistId: newChecklistId,
            title: item.title,
            description: item.description || '',
            icon: item.icon || '',
            isDone: false, // Reset isDone for duplicated items
            sortOrder: item.sortOrder,
          });
        }
      }

      // Reload checklists to show the new duplicate
      await this.loadChecklists();
    } catch (error) {
      console.error('Error duplicating checklist:', error);
      alert('Failed to duplicate checklist. Please try again.');
    }
  }

  openEditChecklistDialog(checklist: Checklist): void {
    if (checklist.id) {
      this.router.navigate(['/checklist', checklist.id, 'edit']);
    }
  }

  openDeleteChecklistDialog(checklist: Checklist): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: checklist.title,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed && checklist.id) {
        try {
          await this.databaseService.deleteChecklist(checklist.id);
          await this.loadChecklists();
          if (this.checklists().length === 0) {
            this.deactivateEditMode();
          }
        } catch (error) {
          console.error('Error deleting checklist:', error);
        }
      }
    });
  }

  onDrop(event: CdkDragDrop<Checklist[]>): void {
    if (!this.isEditMode() || this.isSelectMode()) {
      return;
    }

    const currentChecklists = [...this.checklists()];
    moveItemInArray(currentChecklists, event.previousIndex, event.currentIndex);
    this.checklists.set(currentChecklists);

    const checklistIds = currentChecklists.map((c) => c.id!).filter((id) => id !== undefined);
    if (checklistIds.length > 0) {
      this.databaseService.reorderChecklists(checklistIds).catch((error) => {
        console.error('Error reordering checklists:', error);
        this.loadChecklists();
      });
    }
  }

  onContainerClick(event: MouseEvent): void {
    if (!this.isEditMode() && !this.isSelectMode()) {
      return;
    }

    if (this.editModeJustActivated) {
      return;
    }

    const target = event.target as HTMLElement;
    const clickedTile = target.closest('[cdkDrag]') || target.hasAttribute('cdkDrag');
    const isInteractiveElement = target.closest('button, a, input, select, textarea, mat-checkbox');

    if (!clickedTile && !isInteractiveElement) {
      if (this.isEditMode()) {
        this.deactivateEditMode();
      } else if (this.isSelectMode()) {
        this.deactivateSelectMode();
      }
    }
  }

  getColorClasses(color?: string): { bgClass: string; borderClass: string; textClass: string } {
    return getColorClasses(color, false);
  }

  isChecklistSelected(checklistId?: number): boolean {
    if (!checklistId) return false;
    return this.selectedChecklistIds().has(checklistId);
  }

  onSelectionChanged(event: { item: Checklist; selected: boolean }): void {
    const checklist = event.item;
    const selected = event.selected;
    const currentSelection = new Set(this.selectedChecklistIds());
    if (checklist.id) {
      if (selected) {
        currentSelection.add(checklist.id);
      } else {
        currentSelection.delete(checklist.id);
      }
      this.selectedChecklistIds.set(currentSelection);
    }
  }

  selectAll(): void {
    const allIds = new Set(
      this.checklists()
        .map((c) => c.id)
        .filter((id): id is number => id !== undefined)
    );
    this.selectedChecklistIds.set(allIds);
  }

  deselectAll(): void {
    this.selectedChecklistIds.set(new Set());
  }

  getSelectedCount(): number {
    return this.selectedChecklistIds().size;
  }

  async deleteSelectedChecklists(): Promise<void> {
    const selectedIds = Array.from(this.selectedChecklistIds());
    if (selectedIds.length === 0) return;

    const selectedChecklists = this.checklists().filter((c) => c.id && selectedIds.includes(c.id));
    const titles = selectedChecklists.map((c) => c.title).join(', ');

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: selectedChecklists.length === 1 ? titles : `${selectedChecklists.length} checklists`,
        isGroup: false,
        count: selectedChecklists.length,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          for (const id of selectedIds) {
            await this.databaseService.deleteChecklist(id);
          }
          this.selectedChecklistIds.set(new Set());
          await this.loadChecklists();
          if (this.checklists().length === 0) {
            this.deactivateSelectMode();
          }
        } catch (error) {
          console.error('Error deleting checklists:', error);
        }
      }
    });
  }

  toggleDescription(): void {
    this.isDescriptionExpanded.set(!this.isDescriptionExpanded());
  }

  resetAllChecklists(): void {
    const dialogRef = this.dialog.open(ConfirmResetDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        if (!this.groupId) return;
        this.databaseService.resetChecklistItemsByGroupId(this.groupId!).then(() => {
          this.loadChecklists();
        });
      }
    });
  }
}
