import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Configuracion } from '../../core/models';
import { ConfiguracionService } from '../../core/services/configuracion.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    ToggleSwitchModule,
    ColorPickerModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent {
  config: Configuracion = {
    id: 1,
    isActive: true,
    isActiveImpresora: true,
    text_color_pregunta: "#2A64E1",
    text_color_alternativa: "#2A64E1",
    color_boton_alternativa: "#2A64E1",
    color_letra_alternativa: "#2A64E1",
    color_numeracion: "#2A64E1"
  };
  
  loading = false;

  constructor(
    private messageService: MessageService,
    private configuracionService: ConfiguracionService
  ) {}

  saveConfig() {
    this.loading = true;

    const fotoPayload = {
      isActiveImpresora: this.config.isActiveImpresora,
      isActive: this.config.isActive
    };

    const triviaPayload = {
      text_color_pregunta: this.config.text_color_pregunta || "#2A64E1",
      text_color_alternativa: this.config.text_color_alternativa || "#2A64E1",
      color_boton_alternativa: this.config.color_boton_alternativa || "#2A64E1",
      color_letra_alternativa: this.config.color_letra_alternativa || "#2A64E1",
      color_numeracion: this.config.color_numeracion || "#2A64E1"
    };

    forkJoin({
      foto: this.configuracionService.updateFotoConfig(fotoPayload),
      trivia: this.configuracionService.updateTriviaConfig(triviaPayload)
    }).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Configuración actualizada correctamente' 
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al guardar configuración:', err);
        this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Ocurrió un error al guardar la configuración' 
        });
      }
    });
  }
}
