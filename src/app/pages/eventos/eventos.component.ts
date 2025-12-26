import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Evento } from '../../core/models';
import { EventoService } from '../../core/services/evento.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule
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
  
  eventDialog: boolean = false;
  evento: Evento = this.createEmptyEvent();
  submitted: boolean = false;

  constructor(
    private messageService: MessageService, 
    private confirmationService: ConfirmationService,
    private eventoService: EventoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEventos();
  }

  loadEventos() {
    this.eventos = this.eventoService.getEventos();
  }

  manageDifficulties(evento: Evento) {
    this.router.navigate(['/eventos', evento.id, 'dificultades']);
  }

  openNewEvent() {
    this.evento = this.createEmptyEvent();
    this.submitted = false;
    this.eventDialog = true;
  }

  editEvent(evento: Evento) {
    this.evento = { ...evento };
    this.eventDialog = true;
  }

  deleteEvent(evento: Evento) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar este evento?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventoService.deleteEvento(evento.id);
        this.loadEventos(); // Refresh list
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Evento eliminado', life: 3000 });
      }
    });
  }

  hideEventDialog() {
    this.eventDialog = false;
    this.submitted = false;
  }

  saveEvent() {
    this.submitted = true;

    if (this.evento.nombre?.trim()) {
      this.eventoService.saveEvento(this.evento);
      this.loadEventos(); // Refresh list
      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Evento guardado', life: 3000 });
      this.eventDialog = false;
      this.evento = this.createEmptyEvent();
    }
  }

  createEmptyEvent(): Evento {
    return {
      id: 0,
      nombre: '',
      fecha: '',
      descripcion: '',
      isActive: true,
      evento_dificultad: []
    };
  }
}
