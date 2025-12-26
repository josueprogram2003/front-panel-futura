import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
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

  loadEventos() {
    this.loading = true;
    this.eventoService.getEventos().subscribe({
      next: (data) => {
        this.eventos = data;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar eventos' });
        console.error(err);
        this.loading = false;
      }
    });
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

  editEvent(evento: Evento) {
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
    this.eventoService.getEventoById(evento.id).subscribe({
      next: (freshData) => {
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
      },
      error: (err) => {
        this.loading = false;
        console.error('Error refreshing event data', err);
        // No mostramos error al usuario porque ya tiene los datos de la fila
      }
    });
  }

  deleteEvent(evento: Evento) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar este evento?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.eventoService.deleteEvento(evento.id).subscribe({
          next: (res) => {
            this.loading = false;
            this.loadEventos(); // Refresh list
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: res.message || 'Evento eliminado', life: 3000 });
          },
          error: (err) => {
            this.loading = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al eliminar evento' });
          }
        });
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
        accept: () => {
          this.loading = true;
          this.eventoService.saveEvento(eventoData).subscribe({
            next: (res) => {
              this.loading = false;
              this.loadEventos(); // Refresh list
              this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: res.message || (isEditing ? 'Evento actualizado correctamente' : 'Evento guardado correctamente'), life: 3000 });
              this.eventDialog = false;
            },
            error: (err) => {
              this.loading = false;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al guardar evento' });
            }
          });
        }
      });
    }
  }
}
