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
        await this.loadDificultadByEventoId(this.eventoId || 0);
        await this.getEvento(this.eventoId || 0)
        await this.getDificultades()
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
      if (resp.status == 200) {
        this.evento = resp.response;
      }
    } catch (error) {
      console.log(error)
    }
  }

  async getDificultades(){
    try {
      const resp = await firstValueFrom(this.eventoService.getDificultades())
      if (resp.status == 200) {
        this.dificultades = resp.response;
      }
    } catch (error) {
      console.log(error)
    }
  }

  manageQuestions(eventoDificultad: EventoDificultad) {
    this.router.navigate(['/eventos', this.eventoId, 'dificultades', eventoDificultad.id, 'preguntas']);
  }

  openNewDifficulty() {
    this.submitted = false;
    this.difficultyDialog = true;
  }

  editDifficulty(eventoDificultad: EventoDificultad) {
    
  }

  deleteDifficulty(eventoDificultad: EventoDificultad) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar esta dificultad y todas sus preguntas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (this.evento && this.evento.evento_dificultad) {
            this.evento.evento_dificultad = this.evento.evento_dificultad.filter(val => val.id !== eventoDificultad.id);
            try {
                await firstValueFrom(this.eventoService.saveEvento(this.evento));
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad eliminada', life: 3000 });
                await this.loadDificultadByEventoId(this.eventoId); // Refresh list
            } catch (err) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar dificultad' });
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

    // if (this.eventoDificultad.dificultad && this.evento) {
    //   this.eventoDificultad.dificultad_id = this.eventoDificultad.dificultad.id;

    //   try {
    //       await firstValueFrom(this.eventoService.saveEventoDificultad(this.evento.id, this.eventoDificultad));
    //       this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad guardada', life: 3000 });
    //       this.difficultyDialog = false;
    //       await this.loadDificultadByEventoId(this.eventoId);
    //   } catch (err) {
    //       this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar dificultad' });
    //   }
    // }
  }

}
