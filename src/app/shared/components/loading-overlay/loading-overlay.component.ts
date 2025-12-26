import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div *ngIf="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
      <div class="flex flex-col items-center gap-3">
        <p-progressSpinner 
          styleClass="w-12 h-12" 
          strokeWidth="4" 
          animationDuration=".5s">
        </p-progressSpinner>
        <span class="text-slate-600 font-medium text-sm animate-pulse">{{ message }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class LoadingOverlayComponent {
  @Input() loading: boolean = false;
  @Input() message: string = 'Cargando datos...';
}
