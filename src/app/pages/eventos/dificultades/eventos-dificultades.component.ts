import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Evento, EventoDificultad, Dificultad, EventoDificultadList } from '../../../core/models';
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
  dificultadesEventos: EventoDificultadList[] = [];
  dificultades:Dificultad[] = []
  difficultyDialog: boolean = false;
  submitted: boolean = false;
  loading: boolean = false;
  message: string = '';
  selectedDifficulty: Dificultad | undefined;
  currentEventoDificultadId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.eventoId = Number(id);
        this.loading = true;
        this.message = 'Cargando información del evento...';
        try {
          await this.loadDificultadByEventoId(this.eventoId || 0);
          await this.getEvento(this.eventoId || 0);
          await this.getDificultades();
        } finally {
          this.loading = false;
        }
      }
    });
  }

  async loadDificultadByEventoId(evento_id:number){
    try {
      const res = await firstValueFrom(this.eventoService.getEventosDificultadesByEventoId(evento_id));
      this.dificultadesEventos = res.response;
    } catch (err) {
      console.error(err);
    }
  }

  async getEvento(evento_id:number){
    try {
      const resp = await firstValueFrom(this.eventoService.getEventoById(evento_id))
      this.evento = resp.response;
    } catch (error) {
      console.log(error)
    }
  }

  async getDificultades(){
    try {
      const resp = await firstValueFrom(this.eventoService.getDificultades())
      this.dificultades = resp.response;
    } catch (error) {
      console.log(error)
    }
  }

  manageQuestions(eventoDificultad: EventoDificultad) {
    this.router.navigate(['/eventos', this.eventoId, 'dificultades', eventoDificultad.id, 'preguntas']);
  }

  openNewDifficulty() {
    this.submitted = false;
    this.selectedDifficulty = undefined;
    this.currentEventoDificultadId = 0;
    this.difficultyDialog = true;
  }

  editDifficulty(eventoDificultad: EventoDificultadList) {
    this.currentEventoDificultadId = eventoDificultad.id;
    if (eventoDificultad.dificultad) {
      this.selectedDifficulty = this.dificultades.find(d => d.id === eventoDificultad.dificultad.id);
    }
    this.difficultyDialog = true;
  }

  deleteDifficulty(eventoDificultad: EventoDificultadList) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar esta dificultad y todas sus preguntas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (eventoDificultad.id) {
            this.loading = true;
            this.message = 'Eliminando dificultad...';
            try {
                await firstValueFrom(this.eventoService.deleteEventoDificultad(eventoDificultad.id));
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad eliminada', life: 3000 });
                await this.loadDificultadByEventoId(this.eventoId); // Refresh list
            } catch (err) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar dificultad' });
            } finally {
                this.loading = false;
            }
        }
      }
    });
  }

  hideDialog() {
    this.difficultyDialog = false;
    this.submitted = false;
  }

  async saveDifficulty() {
    this.submitted = true;

    if (this.selectedDifficulty) {
      const payload: EventoDificultad = {
        id: this.currentEventoDificultadId !== 0 ? this.currentEventoDificultadId : undefined,
        evento_id: this.eventoId,
        dificultad_id: this.selectedDifficulty.id,
        isActive: true
      };

      this.loading = true;
      try {
          await firstValueFrom(this.eventoService.saveEventoDificultad(payload));
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad guardada', life: 3000 });
          this.difficultyDialog = false;
          await this.loadDificultadByEventoId(this.eventoId);
      } catch (err:any) {
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: err.error.message });
          console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }

  createEmptyEventoDificultad(): EventoDificultad {
    return {
      evento_id: this.eventoId,
      dificultad_id: 0,
      isActive: true
    };
  }

}
