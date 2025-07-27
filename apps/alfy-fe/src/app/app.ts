import { Component, computed, signal, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { appRoutes } from './app.routes';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [RouterModule, MenubarModule, DrawerModule, ButtonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
  }

  items = signal<MenuItem[]>([]);
  visible = signal<boolean>(false);
  windowWidth = signal(window.innerWidth);
  isMobile = computed(() => this.windowWidth() < 961);

  constructor() {
    this.items.set(this.getMenuItems());
  }


  toggleSidebar() {
    this.visible.update(visible => !visible);
  }

  private getMenuItems = (): MenuItem[] => {
   return appRoutes.map((route) => ({
      label: route.data?.['title'] || route.path,
      icon: route.data?.['icon'] || 'pi pi-home',
      routerLink: route.path,
    })).filter((item) => item.label !== '');
  }
}
