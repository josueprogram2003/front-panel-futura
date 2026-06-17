import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div *ngIf="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[3px] rounded-[inherit]">
      <div class="bg-white px-7 py-5 rounded-2xl shadow-lg border border-[#e4e0da] flex flex-col items-center gap-3">
        <p-progressSpinner
          styleClass="w-10 h-10"
          strokeWidth="3"
          fill="transparent"
          animationDuration=".7s">
        </p-progressSpinner>
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-sm font-semibold text-[#1c1917]">{{ message }}</span>
          <span class="text-xs text-[#a8a29e]">Por favor espere...</span>
        </div>
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
