import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeedDataService } from '../../services/seed-data.service';

@Component({
  selector: 'app-seed-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seed-data.component.html',
})
export class SeedDataComponent {
  private seedDataService = inject(SeedDataService);
  private cdr = inject(ChangeDetectorRef);

  isSeeding = false;
  isClearing = false;
  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';
  logMessages: string[] = [];

  async seedData(): Promise<void> {
    this.isSeeding = true;
    this.logMessages = [];
    this.statusMessage = 'Seeding data...';
    this.statusType = 'info';
    this.cdr.detectChanges();

    try {
      this.addLog('Initializing services...');
      this.addLog('Starting to seed dummy data...');

      await this.seedDataService.seedInitialData();

      this.addLog('✅ Dummy data seeded successfully!');
      this.statusMessage =
        '✅ Data seeded successfully! You can now navigate back to the main app.';
      this.statusType = 'success';
      this.cdr.detectChanges();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog(`❌ Error: ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        this.addLog(error.stack);
      }
      this.statusMessage = '❌ Error seeding data. Check the log below.';
      this.statusType = 'error';
      this.cdr.detectChanges();
    } finally {
      this.isSeeding = false;
      this.cdr.detectChanges();
    }
  }

  async clearData(): Promise<void> {
    if (
      !confirm('Are you sure you want to clear all checklist data? This action cannot be undone.')
    ) {
      return;
    }

    this.isClearing = true;
    this.logMessages = [];
    this.statusMessage = 'Clearing data...';
    this.statusType = 'info';
    this.cdr.detectChanges();

    try {
      this.addLog('Starting to clear all checklist data...');

      await this.seedDataService.clearAllData();

      this.addLog('✅ All checklist data cleared successfully!');
      this.statusMessage = '✅ All data cleared successfully!';
      this.statusType = 'success';
      this.cdr.detectChanges();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog(`❌ Error: ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        this.addLog(error.stack);
      }
      this.statusMessage = '❌ Error clearing data. Check the log below.';
      this.statusType = 'error';
      this.cdr.detectChanges();
    } finally {
      this.isClearing = false;
      this.cdr.detectChanges();
    }
  }

  getStatusClasses(): string {
    switch (this.statusType) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  }

  private addLog(message: string): void {
    this.logMessages.push(message);
    this.cdr.detectChanges();
  }
}
