import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './panel-layout.component.html',
})
export class PanelLayoutComponent {
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void  { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void   { this.sidebarOpen.set(false); }
}
