import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export type MenuConfig = {
  label: string;
  icon: string;
  handler: () => void;
};

@Component({
  selector: 'app-menu',
  imports: [MatMenuModule, MatIconModule],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  menus = input<MenuConfig[]>([]);
}
