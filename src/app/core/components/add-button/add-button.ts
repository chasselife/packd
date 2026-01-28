import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ColorData, getDefaultColor } from '../../constants/color-options.constant';

@Component({
  selector: 'app-add-button',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './add-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddButton {
  add = output<void>();
  icon = input.required<string>();
  label = input.required<string>();
  colorData = input<ColorData>(getDefaultColor());
}
