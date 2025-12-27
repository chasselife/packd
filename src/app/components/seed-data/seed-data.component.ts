import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DummyDataService } from '../../services/dummy-data.service';

@Component({
  selector: 'app-seed-data',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seed-container">
      <h1>Seed Dummy Data</h1>
      <p>Click the button below to seed the database with dummy checklist data.</p>
      <div class="button-group">
        <button [disabled]="isSeeding || isClearing" (click)="seedData()" class="seed-button">
          {{ isSeeding ? 'Seeding...' : 'Seed Data' }}
        </button>
        <button [disabled]="isSeeding || isClearing" (click)="clearData()" class="clear-button">
          {{ isClearing ? 'Clearing...' : 'Clear All Data' }}
        </button>
      </div>

      @if (statusMessage) {
      <div [class]="'status ' + statusType">
        {{ statusMessage }}
      </div>
      } @if (logMessages.length > 0) {
      <div class="log">
        @for (log of logMessages; track $index) {
        <div>{{ log }}</div>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .seed-container {
        max-width: 600px;
        margin: 50px auto;
        padding: 30px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #333;
        margin-top: 0;
      }

      .button-group {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }

      .seed-button,
      .clear-button {
        color: white;
        border: none;
        padding: 12px 24px;
        font-size: 16px;
        border-radius: 4px;
        cursor: pointer;
        flex: 1;
      }

      .seed-button {
        background: #1976d2;
      }

      .seed-button:hover:not(:disabled) {
        background: #1565c0;
      }

      .clear-button {
        background: #d32f2f;
      }

      .clear-button:hover:not(:disabled) {
        background: #c62828;
      }

      .seed-button:disabled,
      .clear-button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .status {
        margin-top: 20px;
        padding: 15px;
        border-radius: 4px;
      }

      .status.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .status.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .status.info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }

      .log {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 4px;
        max-height: 300px;
        overflow-y: auto;
        font-family: monospace;
        font-size: 12px;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class SeedDataComponent {
  private dummyDataService = inject(DummyDataService);

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

    try {
      this.addLog('Initializing services...');
      this.addLog('Starting to seed dummy data...');

      await this.dummyDataService.seedDummyData();

      this.addLog('✅ Dummy data seeded successfully!');
      this.statusMessage =
        '✅ Data seeded successfully! You can now navigate back to the main app.';
      this.statusType = 'success';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog(`❌ Error: ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        this.addLog(error.stack);
      }
      this.statusMessage = '❌ Error seeding data. Check the log below.';
      this.statusType = 'error';
    } finally {
      this.isSeeding = false;
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

    try {
      this.addLog('Starting to clear all checklist data...');

      await this.dummyDataService.clearAllData();

      this.addLog('✅ All checklist data cleared successfully!');
      this.statusMessage = '✅ All data cleared successfully!';
      this.statusType = 'success';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog(`❌ Error: ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        this.addLog(error.stack);
      }
      this.statusMessage = '❌ Error clearing data. Check the log below.';
      this.statusType = 'error';
    } finally {
      this.isClearing = false;
    }
  }

  private addLog(message: string): void {
    this.logMessages.push(message);
  }
}
