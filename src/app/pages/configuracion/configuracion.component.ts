import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    ReactiveFormsModule,
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
  configForm: FormGroup;
  loading = false;

  constructor(
    private messageService: MessageService,
    private configuracionService: ConfiguracionService,
    private fb: FormBuilder
  ) {
    this.configForm = this.fb.group({
      id: [0],
      isActive: [true],
      isActiveImpresora: [true],
      text_color_pregunta: ['#2A64E1', Validators.required],
      text_color_alternativa: ['#2A64E1', Validators.required],
      color_boton_alternativa: ['#2A64E1', Validators.required],
      color_letra_alternativa: ['#2A64E1', Validators.required],
      color_numeracion: ['#2A64E1', Validators.required]
    });
  }

  colors: any = {
    text_color_pregunta: '#2A64E1',
    text_color_alternativa: '#2A64E1',
    color_boton_alternativa: '#2A64E1',
    color_letra_alternativa: '#2A64E1',
    color_numeracion: '#2A64E1'
  };

  ngOnInit() {
    this.loadConfig();
  }

  updateColor(field: string, value: any) {
    if (!value) return;
    const stringValue = String(value);
    const finalValue = stringValue.startsWith('#') ? stringValue : '#' + stringValue;
    this.colors[field] = finalValue;
    this.configForm.get(field)?.setValue(finalValue);
  }

  loadConfig() {
    this.loading = true;
    this.configuracionService.getConfiguracion().subscribe({
      next: (res) => {
        if (res.response) {
            const responseData = res.response as any;
            
            // Ensure colors have hash and update local colors object
            const colorFields = [
              'text_color_pregunta',
              'text_color_alternativa',
              'color_boton_alternativa',
              'color_letra_alternativa',
              'color_numeracion'
            ];

            const patchedData = { ...responseData };
            colorFields.forEach(field => {
               if (patchedData[field]) {
                 const colorWithHash = this.ensureHash(patchedData[field]);
                 patchedData[field] = colorWithHash;
                 this.colors[field] = colorWithHash;
               }
            });

            this.configForm.patchValue({
                ...patchedData,
                isActive: responseData.isActive === 1 || responseData.isActive === '1' || responseData.isActive === true,
                isActiveImpresora: responseData.isActiveImpresora === 1 || responseData.isActiveImpresora === '1' || responseData.isActiveImpresora === true
            });
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

  ensureHash(color: string | undefined | null): string {
    if (!color || !color.trim()) return '#2A64E1';
    const cleaned = color.trim();
    return cleaned.startsWith('#') ? cleaned : '#' + cleaned;
  }

  get config() {
      return this.configForm.value;
  }

  saveConfig() {
    this.loading = true;
    const formValues = this.configForm.value;

    const fotoPayload = {
      isActiveImpresora: formValues.isActiveImpresora,
      isActive: formValues.isActive
    };

    const triviaPayload = {
      text_color_pregunta: this.ensureHash(this.configForm.value.text_color_pregunta),
      text_color_alternativa: this.ensureHash(this.configForm.value.text_color_alternativa),
      color_boton_alternativa: this.ensureHash(this.configForm.value.color_boton_alternativa),
      color_letra_alternativa: this.ensureHash(this.configForm.value.color_letra_alternativa),
      color_numeracion: this.ensureHash(this.configForm.value.color_numeracion)
    };

    console.log('Guardando configuración...', { fotoPayload, triviaPayload });

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
