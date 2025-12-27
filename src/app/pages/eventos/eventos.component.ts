import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Evento } from '../../core/models';
import { EventoService } from '../../core/services/evento.service';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    TagModule,
    TooltipModule,
    LoadingOverlayComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './eventos.component.html',
  styles: [`
    :host ::ng-deep .p-dialog .p-button {
      min-width: 6rem;
    }
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class EventosComponent implements OnInit {
  eventos: Evento[] = [];
  eventForm: FormGroup;
  
  eventDialog: boolean = false;
  submitted: boolean = false;
  loading: boolean = false;

  constructor(
    private messageService: MessageService, 
    private confirmationService: ConfirmationService,
    private eventoService: EventoService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      id: [0],
      nombre: ['', Validators.required],
      descripcion: [''],
      fecha: ['']
    });
  }

  ngOnInit() {
    this.loadEventos();
  }

  async loadEventos() {
    this.loading = true;
    try {
      const res = await firstValueFrom(this.eventoService.getEventos());
      this.eventos = res.response;
      this.loading = false;
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar eventos' });
      console.error(error);
      this.loading = false;
    }
  }

  manageDifficulties(evento: Evento) {
    this.router.navigate(['/eventos', evento.id, 'dificultades']);
  }

  openNewEvent() {
    this.eventForm.reset({
      id: 0,
      nombre: '',
      descripcion: '',
      fecha: ''
    });
    this.submitted = false;
    this.eventDialog = true;
  }

  async editEvent(evento: Evento) {
    // 1. Cargar datos de la fila inmediatamente
    const data = { ...evento };
    if (data.fecha) {
      try {
        data.fecha = new Date(data.fecha).toISOString().split('T')[0];
      } catch (e) {
        console.error('Error parsing date', e);
      }
    }
    this.eventForm.patchValue(data);
    this.eventDialog = true;

    // 2. Actualizar con datos frescos del servidor
    this.loading = true;
    try {
      const res = await firstValueFrom(this.eventoService.getEventoById(evento.id));
      const freshData = res.response;

      if (freshData.fecha) {
        try {
          freshData.fecha = new Date(freshData.fecha).toISOString().split('T')[0];
        } catch (e) {
          console.error('Error parsing date', e);
        }
      }
      // Solo actualizar si el formulario no ha sido modificado por el usuario aún
      if (!this.eventForm.dirty) {
        this.eventForm.patchValue(freshData);
      }
      this.loading = false;
    } catch (err) {
      this.loading = false;
      console.error('Error refreshing event data', err);
      // No mostramos error al usuario porque ya tiene los datos de la fila
    }
  }

  deleteEvent(evento: Evento) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar este evento?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.loading = true;
        try {
          const res = await firstValueFrom(this.eventoService.deleteEvento(evento.id));
          this.loading = false;
          this.loadEventos(); // Refresh list
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: res.message || 'Evento eliminado', life: 3000 });
        } catch (err: any) {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al eliminar evento' });
        }
      }
    });
  }

  toggleVisibility(evento: Evento) {
    // If already visible, do nothing or maybe allow toggle off? 
    // The requirement says "set isVisible=1 for this event and 0 for others".
    // So usually clicking it makes it the active one.
    if (evento.isVisible === 1) return;

    this.confirmationService.confirm({
      message: `¿Deseas marcar el evento "${evento.nombre}" como el evento visible principal? Esto ocultará los demás eventos.`,
      header: 'Confirmar Visibilidad',
      icon: 'pi pi-eye',
      accept: async () => {
        this.loading = true;
        try {
          await firstValueFrom(this.eventoService.setEventoVisible(evento.id));
          this.loading = false;
          this.loadEventos(); // Refresh list to see updates from backend
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Visibilidad actualizada correctamente', life: 3000 });
        } catch (err: any) {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar visibilidad' });
        }
      }
    });
  }

  hideEventDialog() {
    this.eventDialog = false;
    this.submitted = false;
  }

  saveEvent() {
    this.submitted = true;

    if (this.eventForm.valid) {
      const eventoData = this.eventForm.value as Evento;
      const isEditing = eventoData.id && eventoData.id !== 0;
      
      this.confirmationService.confirm({
        message: isEditing ? '¿Estás seguro de que deseas actualizar este evento?' : '¿Estás seguro de que deseas guardar este evento?',
        header: isEditing ? 'Confirmar Actualización' : 'Confirmar Guardado',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          this.loading = true;
          try {
            const res = await firstValueFrom(this.eventoService.saveEvento(eventoData));
            this.loading = false;
            this.loadEventos(); // Refresh list
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: res.message || (isEditing ? 'Evento actualizado correctamente' : 'Evento guardado correctamente'), life: 3000 });
            this.eventDialog = false;
          } catch (err: any) {
            this.loading = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al guardar evento' });
          }
        }
      });
    }
  }
}
