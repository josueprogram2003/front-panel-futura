import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-bienvenidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bienvenidos.component.html',
  styleUrl: './bienvenidos.component.css'
})
export class BienvenidosComponent {
  private readonly authService = inject(AuthService);

  readonly user$ = this.authService.user$;

  readonly stats = [
    {
      value: '03',
      label: 'Modulos clave',
      detail: 'Eventos, dificultades y configuracion',
      tone: 'from-[#dceff3] via-[#eef7f8] to-white',
      icon: 'pi-th-large'
    },
    {
      value: '01',
      label: 'Panel central',
      detail: 'Todo el flujo de administracion en una sola vista',
      tone: 'from-[#efe1ea] via-[#f9f3f7] to-white',
      icon: 'pi-desktop'
    },
    {
      value: '24/7',
      label: 'Acceso rapido',
      detail: 'Atajos y navegacion directa para trabajar mas fluido',
      tone: 'from-[#f5eadf] via-[#fcf6ee] to-white',
      icon: 'pi-bolt'
    }
  ];

  readonly quickActions = [
    {
      title: 'Eventos',
      description: 'Crea eventos, entra al detalle y organiza preguntas por dificultad.',
      route: '/panel/eventos',
      icon: 'pi-calendar',
      accent: 'from-[#d8eef3] to-[#bfe1ea]',
      surface: 'from-[#eff8fa] to-[#f7fcfd]'
    },
    {
      title: 'Dificultades',
      description: 'Define niveles globales para mantener la logica de tus trivias ordenada.',
      route: '/panel/dificultades',
      icon: 'pi-chart-bar',
      accent: 'from-[#eddfe8] to-[#dcc7d8]',
      surface: 'from-[#faf5f8] to-[#fdf9fb]'
    },
    {
      title: 'Configuracion',
      description: 'Ajusta apariencia, colores y comportamiento general del sistema.',
      route: '/panel/configuracion',
      icon: 'pi-cog',
      accent: 'from-[#f7eadc] to-[#eed8c1]',
      surface: 'from-[#fdf7f1] to-[#fffaf6]'
    }
  ];

  readonly highlights = [
    {
      title: 'Interfaz mas clara',
      description: 'La nueva portada prioriza acciones rapidas, contexto visual y jerarquia limpia.',
      icon: 'pi-star'
    },
    {
      title: 'Navegacion consistente',
      description: 'El sidebar ahora conversa mejor con la home y mantiene el mismo lenguaje visual.',
      icon: 'pi-sitemap'
    },
    {
      title: 'Lista para crecer',
      description: 'La estructura queda preparada para conectar autenticacion real y mas modulos.',
      icon: 'pi-external-link'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
