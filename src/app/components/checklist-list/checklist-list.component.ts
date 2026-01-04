import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
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

type ChecklistItemWithType =
  | (Checklist & { isGroup: false })
  | (ChecklistGroup & { isGroup: true });
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { FooterComponent } from '../footer/footer.component';
import { SeedDataService } from '../../services/seed-data.service';
import { ChecklistTileComponent } from '../checklist-tile/checklist-tile.component';

@Component({
  selector: 'app-checklist-list',
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
  templateUrl: './checklist-list.component.html',
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
export class ChecklistListComponent implements OnInit, OnDestroy {
  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private seedDataService = inject(SeedDataService);

  checklists = signal<Checklist[]>([]);
  checklistGroups = signal<ChecklistGroup[]>([]);
  isLoading = signal(true);
  isEditMode = signal(false);
  isSelectMode = signal(false);

  // Combined sorted array of groups and checklists with isGroup flag
  sortedItems = signal<ChecklistItemWithType[]>([]);

  // Map to store checklist counts for each group
  groupChecklistCounts = signal<Map<number, number>>(new Map());

  // Selection state
  selectedChecklistIds = signal<Set<number>>(new Set());
  selectedGroupIds = signal<Set<number>>(new Set());

  private longPressTimer: number | null = null;
  private readonly LONG_PRESS_DURATION = 500; // milliseconds
  private editModeJustActivated = false;
  private routerSubscription?: Subscription;

  // Touch tracking for mobile scroll detection
  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;

  async ngOnInit(): Promise<void> {
    await this.seedDataService.seedInitialData();
    await this.loadData();

    // Reload checklists when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Only reload if we're on the root path
        if (event.urlAfterRedirects === '/' || event.urlAfterRedirects === '') {
          this.loadData();
        }
      });
  }

  async loadSampleData() {
    await this.seedDataService.forceSeedInitialData();
    await this.loadData();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading.set(true);
      // Load groups
      const allGroups = await this.databaseService.getAllChecklistGroups();
      // Sort groups by sortOrder
      const sortedGroups = [...allGroups].sort((a, b) => a.sortOrder - b.sortOrder);
      this.checklistGroups.set(sortedGroups);

      // Load checklist counts for each group
      const countsMap = new Map<number, number>();
      for (const group of sortedGroups) {
        if (group.id) {
          const checklistsInGroup = await this.databaseService.getChecklistsByGroupId(group.id);
          countsMap.set(group.id, checklistsInGroup.length);
        }
      }
      this.groupChecklistCounts.set(countsMap);

      // Load ungrouped checklists
      const ungroupedChecklists = await this.databaseService.getUngroupedChecklists();
      // Ensure all checklists have sortOrder (migration for existing data)
      const checklistsNeedingMigration = ungroupedChecklists.filter(
        (c) => c.sortOrder === undefined
      );
      if (checklistsNeedingMigration.length > 0) {
        // Migrate checklists without sortOrder
        // Get max sortOrder from both groups and checklists
        const maxGroupSortOrder =
          sortedGroups.length > 0 ? Math.max(...sortedGroups.map((g) => g.sortOrder)) : -1;
        const maxChecklistSortOrder = ungroupedChecklists
          .filter((c) => c.sortOrder !== undefined)
          .reduce((max, c) => Math.max(max, c.sortOrder!), -1);
        const maxSortOrder = Math.max(maxGroupSortOrder, maxChecklistSortOrder);

        for (let i = 0; i < checklistsNeedingMigration.length; i++) {
          const checklist = checklistsNeedingMigration[i];
          if (checklist.id) {
            await this.databaseService.updateChecklist(checklist.id, {
              sortOrder: maxSortOrder + 1 + i,
            });
          }
        }
        // Reload after migration
        const migratedChecklists = await this.databaseService.getUngroupedChecklists();
        const sortedChecklists = [...migratedChecklists].sort((a, b) => a.sortOrder - b.sortOrder);
        this.checklists.set(sortedChecklists);

        // Create combined sorted array with isGroup flag
        const combinedItemsAfterMigration: ChecklistItemWithType[] = [
          ...sortedGroups.map((g) => ({ ...g, isGroup: true as const })),
          ...sortedChecklists.map((c) => ({ ...c, isGroup: false as const })),
        ].sort((a, b) => a.sortOrder - b.sortOrder);
        this.sortedItems.set(combinedItemsAfterMigration);
      } else {
        // Sort checklists by sortOrder
        const sortedChecklists = [...ungroupedChecklists].sort((a, b) => a.sortOrder - b.sortOrder);
        this.checklists.set(sortedChecklists);

        // Create combined sorted array with isGroup flag
        const combinedItems: ChecklistItemWithType[] = [
          ...sortedGroups.map((g) => ({ ...g, isGroup: true as const })),
          ...sortedChecklists.map((c) => ({ ...c, isGroup: false as const })),
        ].sort((a, b) => a.sortOrder - b.sortOrder);
        this.sortedItems.set(combinedItems);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadChecklists(): Promise<void> {
    await this.loadData();
  }

  onChecklistClick(checklist: Checklist): void {
    if (checklist.id) {
      this.router.navigate(['/checklist', checklist.id]);
    }
  }

  openNewChecklistDialog(): void {
    this.router.navigate(['/checklist/new']);
  }

  openNewChecklistGroupDialog(): void {
    this.router.navigate(['/checklist-group/new']);
  }

  onChecklistGroupClick(group: ChecklistGroup): void {
    if (group.id) {
      this.router.navigate(['/checklist-group', group.id]);
    }
  }

  onTileMouseDown(item: Checklist | ChecklistGroup, event: MouseEvent | TouchEvent): void {
    if (this.isEditMode() || this.isSelectMode()) {
      return; // Don't trigger long press in edit mode or select mode
    }

    // Track touch start position for mobile scroll detection
    if (event instanceof TouchEvent && event.touches && event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.touchMoved = false;
    }

    // Don't prevent default - allow normal scrolling to work
    // Long press detection doesn't require preventDefault
    event.stopPropagation();

    this.longPressTimer = window.setTimeout(() => {
      this.activateEditMode();
      // Set a flag to prevent immediate deactivation
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

    // If movement is significant (more than 10px), mark as moved (scrolling)
    if (deltaX > 10 || deltaY > 10) {
      this.touchMoved = true;
      // Clear long press timer if scrolling
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
    // Clear the flag after mouse up
    setTimeout(() => {
      this.editModeJustActivated = false;
    }, this.LONG_PRESS_DURATION);
    // Stop propagation to prevent the event from triggering container click
    // which would immediately deactivate edit mode after long press
    event.stopPropagation();
  }

  onTileTouchEnd(item: Checklist | ChecklistGroup, event: TouchEvent, isGroup: boolean): void {
    // Clear long press timer
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Only navigate if touch didn't move (was a tap, not a scroll)
    if (!this.touchMoved && !this.isEditMode() && !this.isSelectMode()) {
      if (isGroup) {
        // It's a ChecklistGroup
        this.onChecklistGroupClick(item as ChecklistGroup);
      } else {
        // It's a Checklist
        this.onChecklistClick(item as Checklist);
      }
    }

    // Reset touch tracking
    this.touchMoved = false;
    this.touchStartX = 0;
    this.touchStartY = 0;

    // Stop propagation
    event.stopPropagation();
  }

  onTileMouseLeave(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    // Clear the flag after mouse leave
    setTimeout(() => {
      this.editModeJustActivated = false;
    }, this.LONG_PRESS_DURATION);

    // Note: We don't stop propagation here as mouseleave doesn't trigger click events
  }

  activateEditMode(): void {
    this.isEditMode.set(true);
    this.isSelectMode.set(false);
    this.selectedChecklistIds.set(new Set());
    this.selectedGroupIds.set(new Set());
  }

  deactivateEditMode(): void {
    this.isEditMode.set(false);
    this.selectedChecklistIds.set(new Set());
    this.selectedGroupIds.set(new Set());
  }

  activateSelectMode(): void {
    this.isSelectMode.set(true);
    this.isEditMode.set(false);
    this.selectedChecklistIds.set(new Set());
    this.selectedGroupIds.set(new Set());
  }

  deactivateSelectMode(): void {
    this.isSelectMode.set(false);
    this.selectedChecklistIds.set(new Set());
    this.selectedGroupIds.set(new Set());
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
    if (!checklist.id) return;

    try {
      // Get the original checklist to ensure we have all data
      const originalChecklist = await this.databaseService.getChecklist(checklist.id);
      if (!originalChecklist || !originalChecklist.id) return;

      // Create duplicate checklist with "Copy" appended to title
      const newChecklistId = await this.databaseService.createChecklist({
        title: `${originalChecklist.title} Copy`,
        icon: originalChecklist.icon,
        color: originalChecklist.color,
        groupId: originalChecklist.groupId,
      });

      if (!newChecklistId) return;

      // Get all checklists in the same group (or ungrouped) to calculate sortOrder
      const relevantChecklists = originalChecklist.groupId
        ? await this.databaseService.getChecklistsByGroupId(originalChecklist.groupId)
        : await this.databaseService.getUngroupedChecklists();

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
      const items = await this.databaseService.getChecklistItems(originalChecklist.id!);
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

      // Reload data to show the new checklist
      await this.loadData();
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
          // Reload checklists to remove the deleted one
          await this.loadChecklists();
          // Exit edit mode if no checklists remain
          if (this.checklists().length === 0) {
            this.deactivateEditMode();
          }
        } catch (error) {
          console.error('Error deleting checklist:', error);
        }
      }
    });
  }

  openImportPage(): void {
    this.router.navigate(['/import']);
  }

  openExportPage(): void {
    this.router.navigate(['/export']);
  }

  openSearchPage(): void {
    this.router.navigate(['/search']);
  }

  async onCombinedDrop(event: CdkDragDrop<ChecklistItemWithType[]>): Promise<void> {
    if (!this.isEditMode() || this.isSelectMode()) {
      return; // Only allow reordering in edit mode (not select mode)
    }

    // Get current sorted items
    const allItems = [...this.sortedItems()];

    // Move the item in the combined array
    moveItemInArray(allItems, event.previousIndex, event.currentIndex);

    // Update sortOrder for all items based on their new positions
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      if (item.id) {
        if (item.isGroup) {
          await this.databaseService.updateChecklistGroup(item.id, {
            sortOrder: i,
          });
        } else {
          await this.databaseService.updateChecklist(item.id, {
            sortOrder: i,
          });
        }
      }
    }

    // Update the sorted items signal
    this.sortedItems.set(allItems);

    // Separate back into groups and checklists for the individual signals
    const newGroups = allItems
      .filter((item): item is ChecklistGroup & { isGroup: true } => item.isGroup)
      .map(({ isGroup, ...g }) => g);
    const newChecklists = allItems
      .filter((item): item is Checklist & { isGroup: false } => !item.isGroup)
      .map(({ isGroup, ...c }) => c);

    this.checklistGroups.set(newGroups);
    this.checklists.set(newChecklists);
  }

  onDrop(event: CdkDragDrop<Checklist[]>): void {
    if (!this.isEditMode() || this.isSelectMode()) {
      return; // Only allow reordering in edit mode (not select mode)
    }

    const currentChecklists = [...this.checklists()];
    moveItemInArray(currentChecklists, event.previousIndex, event.currentIndex);
    this.checklists.set(currentChecklists);

    // Persist the new order to the database
    const checklistIds = currentChecklists.map((c) => c.id!).filter((id) => id !== undefined);
    if (checklistIds.length > 0) {
      this.databaseService.reorderChecklists(checklistIds).catch((error) => {
        console.error('Error reordering checklists:', error);
        // Reload checklists on error to restore correct order
        this.loadChecklists();
      });
    }
  }

  onGroupDrop(event: CdkDragDrop<ChecklistGroup[]>): void {
    if (!this.isEditMode() || this.isSelectMode()) {
      return;
    }

    const currentGroups = [...this.checklistGroups()];
    moveItemInArray(currentGroups, event.previousIndex, event.currentIndex);
    this.checklistGroups.set(currentGroups);

    const groupIds = currentGroups.map((g) => g.id!).filter((id) => id !== undefined);
    if (groupIds.length > 0) {
      this.databaseService.reorderChecklistGroups(groupIds).catch((error) => {
        console.error('Error reordering checklist groups:', error);
        this.loadData();
      });
    }
  }

  onGroupEditClick(group: ChecklistGroup, event: Event): void {
    event.stopPropagation();
    if (group.id) {
      this.router.navigate(['/checklist-group', group.id, 'edit']);
    }
  }

  onGroupDeleteClick(group: ChecklistGroup, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: group.title,
        isGroupt: true,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed && group.id) {
        try {
          await this.databaseService.deleteChecklistGroup(group.id);
          await this.loadData();
          if (this.checklistGroups().length === 0 && this.checklists().length === 0) {
            this.deactivateEditMode();
          }
        } catch (error) {
          console.error('Error deleting checklist group:', error);
        }
      }
    });
  }

  async onGroupDuplicateClick(group: ChecklistGroup, event: Event): Promise<void> {
    event.stopPropagation();
    if (!group.id) return;

    try {
      // Get the original group to ensure we have all data
      const originalGroup = await this.databaseService.getChecklistGroup(group.id);
      if (!originalGroup || !originalGroup.id) return;

      // Create duplicate group
      const newGroupId = await this.databaseService.createChecklistGroup({
        title: `${originalGroup.title} Copy`,
        icon: originalGroup.icon,
        color: originalGroup.color,
      });

      if (!newGroupId) return;

      // Get all groups to calculate sortOrder
      const allGroups = await this.databaseService.getAllChecklistGroups();

      // Find the original group's sortOrder
      const originalSortOrder = originalGroup.sortOrder;

      // Update the duplicate's sortOrder to be right after the original
      await this.databaseService.updateChecklistGroup(newGroupId, {
        sortOrder: originalSortOrder + 1,
      });

      // Shift all groups after the original by 1 to make room
      const groupsToShift = allGroups.filter(
        (g) => g.sortOrder > originalSortOrder && g.id !== newGroupId && g.id !== originalGroup.id
      );

      for (const g of groupsToShift) {
        if (g.id) {
          await this.databaseService.updateChecklistGroup(g.id, {
            sortOrder: g.sortOrder + 1,
          });
        }
      }

      // Get all checklists in the group
      const checklistsInGroup = await this.databaseService.getChecklistsByGroupId(originalGroup.id);

      // Duplicate each checklist and its items
      for (const checklist of checklistsInGroup) {
        if (!checklist.id) continue;

        // Create duplicate checklist
        const newChecklistId = await this.databaseService.createChecklist({
          title: checklist.title,
          icon: checklist.icon,
          color: checklist.color,
          groupId: newGroupId,
        });

        // Get items from the original checklist and duplicate them
        const items = await this.databaseService.getChecklistItems(checklist.id);
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
      }

      // Reload data to show the new group
      await this.loadData();
    } catch (error) {
      console.error('Error duplicating checklist group:', error);
      alert('Failed to duplicate group. Please try again.');
    }
  }

  onContainerClick(event: MouseEvent): void {
    if (!this.isEditMode() && !this.isSelectMode()) {
      return;
    }

    // Don't deactivate if edit mode was just activated (prevents immediate deactivation after long press)
    if (this.editModeJustActivated) {
      return;
    }

    // Check if the click target is within a tile or is an interactive element
    const target = event.target as HTMLElement;
    const clickedTile = target.closest('[cdkDrag]') || target.hasAttribute('cdkDrag');
    const isInteractiveElement = target.closest('button, a, input, select, textarea, mat-checkbox');

    // If click is not on a tile and not on an interactive element, deactivate current mode
    if (!clickedTile && !isInteractiveElement) {
      if (this.isEditMode()) {
        this.deactivateEditMode();
      } else if (this.isSelectMode()) {
        this.deactivateSelectMode();
      }
    }
  }

  getGroupChecklistCount(groupId?: number): number {
    if (!groupId) return 0;
    return this.groupChecklistCounts().get(groupId) || 0;
  }

  getColorClasses(color?: string): { bgClass: string; borderClass: string; textClass: string } {
    return getColorClasses(color, false);
  }

  isItemSelected(item: ChecklistItemWithType): boolean {
    if (!item.id) return false;
    if (item.isGroup) {
      return this.selectedGroupIds().has(item.id);
    } else {
      return this.selectedChecklistIds().has(item.id);
    }
  }

  onSelectionChanged(event: { item: Checklist | ChecklistGroup; selected: boolean }): void {
    const item = event.item;
    const selected = event.selected;
    if (!item.id) return;

    // Check if it's a group by checking if it exists in checklistGroups
    const isGroup = this.checklistGroups().some((g) => g.id === item.id);

    if (isGroup) {
      const currentSelection = new Set(this.selectedGroupIds());
      if (selected) {
        currentSelection.add(item.id);
      } else {
        currentSelection.delete(item.id);
      }
      this.selectedGroupIds.set(currentSelection);
    } else {
      const currentSelection = new Set(this.selectedChecklistIds());
      if (selected) {
        currentSelection.add(item.id);
      } else {
        currentSelection.delete(item.id);
      }
      this.selectedChecklistIds.set(currentSelection);
    }
  }

  selectAll(): void {
    const allGroupIds = new Set(
      this.checklistGroups()
        .map((g) => g.id)
        .filter((id): id is number => id !== undefined)
    );
    const allChecklistIds = new Set(
      this.checklists()
        .map((c) => c.id)
        .filter((id): id is number => id !== undefined)
    );
    this.selectedGroupIds.set(allGroupIds);
    this.selectedChecklistIds.set(allChecklistIds);
  }

  deselectAll(): void {
    this.selectedGroupIds.set(new Set());
    this.selectedChecklistIds.set(new Set());
  }

  getSelectedCount(): number {
    return this.selectedChecklistIds().size + this.selectedGroupIds().size;
  }

  async deleteSelectedItems(): Promise<void> {
    const selectedChecklistIds = Array.from(this.selectedChecklistIds());
    const selectedGroupIds = Array.from(this.selectedGroupIds());
    const totalCount = selectedChecklistIds.length + selectedGroupIds.length;

    if (totalCount === 0) return;

    const selectedChecklists = this.checklists().filter(
      (c) => c.id && selectedChecklistIds.includes(c.id)
    );
    const selectedGroups = this.checklistGroups().filter(
      (g) => g.id && selectedGroupIds.includes(g.id)
    );

    let titleText = '';
    if (totalCount === 1) {
      if (selectedChecklists.length > 0) {
        titleText = selectedChecklists[0].title;
      } else {
        titleText = selectedGroups[0].title;
      }
    } else {
      titleText = `${totalCount} items`;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: titleText,
        isGroup: selectedGroups.length > 0 && selectedChecklists.length === 0,
        count: totalCount,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          // Delete selected checklists
          for (const id of selectedChecklistIds) {
            await this.databaseService.deleteChecklist(id);
          }
          // Delete selected groups
          for (const id of selectedGroupIds) {
            await this.databaseService.deleteChecklistGroup(id);
          }
          this.selectedChecklistIds.set(new Set());
          this.selectedGroupIds.set(new Set());
          await this.loadData();
          if (this.checklistGroups().length === 0 && this.checklists().length === 0) {
            this.deactivateSelectMode();
          }
        } catch (error) {
          console.error('Error deleting items:', error);
        }
      }
    });
  }
}
