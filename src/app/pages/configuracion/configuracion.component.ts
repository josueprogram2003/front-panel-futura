import { Component, OnInit } from '@angular/core';
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
export class ConfiguracionComponent implements OnInit {
  config: Configuracion = {
    id: 0,
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

  ngOnInit() {
    this.loadConfig();
  }

  loadConfig() {
    this.loading = true;
    this.configuracionService.getConfiguracion().subscribe({
      next: (res) => {
        if (res.response) {
            const responseData = res.response as any;
            this.config = {
                ...res.response,
                isActive: responseData.isActive === 1 || responseData.isActive === '1' || responseData.isActive === true,
                isActiveImpresora: responseData.isActiveImpresora === 1 || responseData.isActiveImpresora === '1' || responseData.isActiveImpresora === true
            };
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar configuración:', err);
        this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Error al cargar la configuración' 
        });
      }
    });
  }

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
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Éxito', 
            detail: 'Configuración actualizada correctamente' 
        });
        this.loadConfig();
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
