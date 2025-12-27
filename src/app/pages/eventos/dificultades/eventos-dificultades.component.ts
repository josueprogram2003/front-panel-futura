import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Evento, EventoDificultad, Dificultad } from '../../../core/models';
import { EventoService } from '../../../core/services/evento.service';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-eventos-dificultades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    LoadingOverlayComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './eventos-dificultades.component.html'
})
export class EventosDificultadesComponent implements OnInit {
  eventoId!: number;
  evento: Evento | undefined;
  dificultades: Dificultad[] = [];
  
  difficultyDialog: boolean = false;
  eventoDificultad: EventoDificultad = this.createEmptyEventoDificultad();
  submitted: boolean = false;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.eventoService.getDificultades().subscribe({
      next: (data) => {
        this.dificultades = data;
      },
      error: (err) => console.error(err)
    });
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventoId = +id;
        this.loadEvento();
      }
    });
  }

  loadEvento() {
    this.loading = true;
    
    // 1. Cargar metadatos del evento
    this.eventoService.getEventoById(this.eventoId).subscribe({
      next: (data) => {
        this.evento = data;
        
        if (!this.evento) {
             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Evento no encontrado' });
             this.router.navigate(['/eventos']);
             return;
        }

        // 2. Cargar dificultades asociadas
        this.loadDificultadesPorEvento();
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar evento' });
      }
    });
  }

  loadDificultadesPorEvento() {
    this.eventoService.getEventosDificultadesByEventoId(this.eventoId).subscribe({
      next: (data) => {
        if (this.evento) {
            this.evento.evento_dificultad = data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading event difficulties', err);
        // No bloqueamos la vista, solo no se mostrarán dificultades
      }
    });
  }

  manageQuestions(eventoDificultad: EventoDificultad) {
    this.router.navigate(['/eventos', this.eventoId, 'dificultades', eventoDificultad.id, 'preguntas']);
  }

  openNewDifficulty() {
    this.eventoDificultad = this.createEmptyEventoDificultad();
    this.submitted = false;
    this.difficultyDialog = true;
  }

  editDifficulty(eventoDificultad: EventoDificultad) {
    this.eventoDificultad = JSON.parse(JSON.stringify(eventoDificultad));
    this.difficultyDialog = true;
  }

  deleteDifficulty(eventoDificultad: EventoDificultad) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar esta dificultad y todas sus preguntas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.evento && this.evento.evento_dificultad) {
            this.evento.evento_dificultad = this.evento.evento_dificultad.filter(val => val.id !== eventoDificultad.id);
            this.eventoService.saveEvento(this.evento).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad eliminada', life: 3000 });
                    this.loadDificultadesPorEvento(); // Refresh list
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar dificultad' });
                }
            });
        }
      }
    });
  }

  hideDialog() {
    this.difficultyDialog = false;
    this.submitted = false;
  }

  saveDifficulty() {
    this.submitted = true;

    if (this.eventoDificultad.dificultad && this.evento) {
      this.eventoDificultad.dificultad_id = this.eventoDificultad.dificultad.id;

      this.eventoService.saveEventoDificultad(this.evento.id, this.eventoDificultad).subscribe({
          next: () => {
              this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad guardada', life: 3000 });
              this.difficultyDialog = false;
              this.eventoDificultad = this.createEmptyEventoDificultad();
              this.loadDificultadesPorEvento(); // Refresh list only
          },
          error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar dificultad' });
          }
      });
    }
  }

  createEmptyEventoDificultad(): EventoDificultad {
    return {
        id: 0,
        evento_id: this.eventoId,
        dificultad_id: 0,
        isActive: true,
        preguntas: []
    };
  }
}
