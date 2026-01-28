import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ColorData, getDefaultColor } from '../../constants/color-options.constant';

@Component({
  selector: 'app-back-button',
  imports: [MatIconModule],
  templateUrl: './back-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButton {
  back = output<void>();
  colorData = input<ColorData>(getDefaultColor());
}
