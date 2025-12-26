import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Configuracion } from '../../core/models';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    isActiveImpresora: false,
    text_color_pregunta: "#263A85",
    text_color_alternativa: "#263A85",
    color_boton_alternativa: "#263A85",
    color_letra_alternativa: "#E4000E",
    preguntas_por_ronda: 4,
    preguntas_para_ganar: 3
  };

  constructor(private messageService: MessageService) {}

  saveConfig() {
    // Validate
    if (this.config.preguntas_para_ganar && this.config.preguntas_por_ronda && this.config.preguntas_para_ganar > this.config.preguntas_por_ronda) {
        this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Las preguntas para ganar no pueden ser mayores que las preguntas por ronda.' 
        });
        return;
    }

    // Here we would typically call a service to update the configuration
    console.log('Guardando configuración:', this.config);
    
    this.messageService.add({ 
        severity: 'success', 
        summary: 'Éxito', 
        detail: 'Configuración actualizada correctamente' 
    });
  }
}
