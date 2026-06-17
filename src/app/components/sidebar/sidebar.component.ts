import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Ripple],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  @Output() closeSidebar = new EventEmitter<void>();

  readonly user$ = this.authService.user$;

  readonly menuSections = [
    {
      title: 'Principal',
      items: [
        {
          label: 'Inicio',
          route: '/panel/bienvenidos',
          icon: 'pi-home',
          description: 'Resumen general del panel',
          exact: true
        },
        {
          label: 'Configuración',
          route: '/panel/configuracion',
          icon: 'pi-cog',
          description: 'Ajustes globales del sistema',
          exact: true
        }
      ]
    },
    {
      title: 'Trivia',
      items: [
        {
          label: 'Eventos',
          route: '/panel/eventos',
          icon: 'pi-calendar',
          description: 'Eventos, dificultades y preguntas',
          exact: false
        },
        {
          label: 'Dificultades',
          route: '/panel/dificultades',
          icon: 'pi-chart-bar',
          description: 'Niveles globales de la trivia',
          exact: true
        }
      ]
    },
    {
      title: 'Administración',
      items: [
        {
          label: 'Usuarios',
          route: '/panel/usuarios',
          icon: 'pi-users',
          description: 'Gestión de accesos y roles',
          exact: true
        }
      ]
    },
  ];

  logout(): void {
    this.closeSidebar.emit();
    this.authService.logout();
  }
}
