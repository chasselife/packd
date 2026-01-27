import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColorOption } from '../../../core/constants/color-options.constant';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() colors: ColorOption[] = [];
  @Input() selectedColor: string | null = null;
  @Output() colorChange = new EventEmitter<string>();

  private onChange = (value: string) => {};
  private onTouched = () => {};

  selectColor(color: string): void {
    this.selectedColor = color;
    this.onChange(color);
    this.onTouched();
    this.colorChange.emit(color);
  }

  isSelected(color: string): boolean {
    return this.selectedColor === color;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.selectedColor = value || null;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
