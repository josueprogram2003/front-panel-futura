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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
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
    ToggleSwitchModule,
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
      // Convert isVisible number to boolean for UI
      this.eventos = res.response.map(e => ({
        ...e,
        isActiveBoolean: e.isVisible === 1 
      })) as any[];
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

  onVisibilityChange(evento: any) {
    // Revert the toggle immediately because we want to confirm first
    evento.isActiveBoolean = !evento.isActiveBoolean;

    // If it was already active (we are trying to deactivate), prevent it if single active is enforced
    // But requirement says "set isVisible=1 for this event and 0 for others", usually implies selecting a new active one.
    // Assuming clicking an inactive switch makes it active.
    
    // Logic: 
    // If the user clicked to ACTIVATE (currently false -> true), we confirm and then activate.
    // If the user clicked to DEACTIVATE (currently true -> false), we might warn them or just allow it (setting all to 0?).
    // Based on previous logic `toggleVisibility`, it seems we only care about Activating one.

    if (evento.isVisible === 1) {
        // User tried to turn OFF the active event
        this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Debes activar otro evento para desactivar este.' });
        evento.isActiveBoolean = true; // Force keep on
        return;
    }

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
          // Revert on error
          evento.isActiveBoolean = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar visibilidad' });
        }
      },
      reject: () => {
          // Revert if rejected
          evento.isActiveBoolean = false;
      }
    });
  }

  toggleVisibility(evento: Evento) {
     // Deprecated in favor of switch
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
