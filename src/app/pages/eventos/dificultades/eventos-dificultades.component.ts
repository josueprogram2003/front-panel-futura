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
    ConfirmDialogModule
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.dificultades = this.eventoService.getDificultades();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventoId = +id;
        this.loadEvento();
      }
    });
  }

  loadEvento() {
    this.evento = this.eventoService.getEventoById(this.eventoId);
    if (!this.evento) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Evento no encontrado' });
      this.router.navigate(['/eventos']);
    }
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
          this.eventoService.saveEvento(this.evento); // Persist changes
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad eliminada', life: 3000 });
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
      if (!this.evento.evento_dificultad) {
        this.evento.evento_dificultad = [];
      }

      // Sync ID
      this.eventoDificultad.dificultad_id = this.eventoDificultad.dificultad.id;

      if (this.eventoDificultad.id) {
        const index = this.evento.evento_dificultad.findIndex(d => d.id === this.eventoDificultad.id);
        if (index !== -1) {
            this.evento.evento_dificultad[index] = this.eventoDificultad;
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad actualizada', life: 3000 });
        }
      } else {
        this.eventoDificultad.id = this.eventoService.createId();
        this.eventoDificultad.evento_id = this.evento.id;
        this.evento.evento_dificultad.push(this.eventoDificultad);
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad creada', life: 3000 });
      }

      this.eventoService.saveEvento(this.evento); // Persist changes
      this.difficultyDialog = false;
      this.eventoDificultad = this.createEmptyEventoDificultad();
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
