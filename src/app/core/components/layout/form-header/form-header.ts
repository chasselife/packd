import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ColorData, getDefaultColor } from '../../../constants/color-options.constant';

@Component({
  selector: 'app-form-header',
  imports: [MatIconModule],
  templateUrl: './form-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormHeader {
  icon = input<string | undefined>();
  title = input<string | undefined>();
  colorData = input<ColorData>(getDefaultColor());
}
