import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div *ngIf="loading" class="fixed w-full inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-[inherit] transition-all duration-300" style="z-index: 10000000000 !important;">
      <div class="bg-white px-8 py-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 transform transition-all animate-fade-in-up">
        <div class="relative flex items-center justify-center">
            <p-progressSpinner 
              styleClass="w-12 h-12" 
              strokeWidth="4" 
              fill="transparent" 
              animationDuration=".8s">
            </p-progressSpinner>
        </div>
        <div class="flex flex-col items-center gap-1">
            <span class="text-slate-700 font-semibold text-sm tracking-wide">{{ message }}</span>
            <span class="text-slate-400 text-xs">Por favor espere...</span>
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
