import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenidos',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './bienvenidos.component.html'
})
export class BienvenidosComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
