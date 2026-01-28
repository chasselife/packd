import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ColorData } from '../../../constants/color-options.constant';

@Component({
  selector: 'app-page-header',
  imports: [MatIconModule],
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  icon = input<string | undefined>();
  title = input<string | undefined>();
  colorData = input<ColorData>();
}
