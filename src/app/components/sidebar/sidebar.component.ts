import { Component, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Ripple],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() closeSidebar = new EventEmitter<void>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  // Use this getter to safely access document only in browser
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  menuItems = [
    {
      label: 'Configuración',
      icon: 'settings',
      route: '/configuracion'
    },
    {
      label: 'Eventos y Preguntas',
      icon: 'event',
      route: '/eventos'
    }
  ];
}
