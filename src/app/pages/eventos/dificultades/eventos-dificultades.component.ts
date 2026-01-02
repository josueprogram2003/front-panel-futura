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
        
        // 1. Check for state passed from previous route
        const state = history.state;
        if (state && state.eventoData) {
            this.evento = state.eventoData;
        }

        this.loading = true;
        this.message = 'Cargando información del evento...';
        try {
          // If event wasn't passed in state, fetch it
          if (!this.evento) {
             await this.getEvento(this.eventoId || 0);
          }

          const isPredeterminado = this.evento?.isPredeterminado === true || this.evento?.isPredeterminado === (1 as any);
          console.log('Evento predeterminado:', isPredeterminado);
          console.log('Evento datos:', this.evento);
          if (isPredeterminado) {
              let cantidad = 0;
              try {
                   const res = await firstValueFrom(this.eventoService.getPreguntasCountByEventoId(this.eventoId));
                   cantidad = res.response?.cantidad || 0;
              } catch (e) {
                   console.error('Error al obtener cantidad de preguntas', e);
              }

              // Mock "Predeterminado" difficulty
              const defaultDiff: Dificultad = {
                  id: 0,
                  nombre: 'Predeterminado',
                  isActive: true
              };
              
              this.dificultadesEventos = [{
                  id: 0,
                  evento: this.evento!,
                  dificultad: defaultDiff,
                  cantidad_preguntas: cantidad
              }];
          } else {
              // Load existing difficulties
              await this.loadDificultadByEventoId(this.eventoId || 0);
              // Load catalog
              await this.getDificultades();

              // Remove any "Predeterminado" difficulty from the list if it accidentally appears
              this.dificultadesEventos = this.dificultadesEventos.filter(ed => ed.dificultad.nombre.toLowerCase() !== 'predeterminado');
          }

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
      if(!this.evento?.isPredeterminado === true){
        console.log('Removiendo predeterminado de la lista');
        this.dificultadesEventos = this.dificultadesEventos.filter(ed => ed.dificultad.nombre.toLowerCase() !== 'predeterminado');
      }
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

  manageQuestions(eventoDificultad: any) {
    const isPredeterminado = this.evento?.isPredeterminado === true || this.evento?.isPredeterminado === (1 as any);
    this.router.navigate(['/eventos', this.eventoId, 'dificultades', eventoDificultad.id, 'preguntas'], {
      state: { 
        difficultyName: eventoDificultad.dificultad.nombre,
        eventName: this.evento?.nombre,
        isPredeterminado: isPredeterminado ? true : null
      }
    });
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
      key: 'eventosDificultadesConfirm',
      message: '¿Estás seguro de eliminar esta dificultad y todas sus preguntas?',
      header: 'Confirmar Eliminación',
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
      const isEdit = this.currentEventoDificultadId !== 0;
      
      this.confirmationService.confirm({
        key: 'eventosDificultadesConfirm',
        message: isEdit ? '¿Estás seguro de actualizar esta dificultad?' : '¿Estás seguro de agregar esta dificultad?',
        header: isEdit ? 'Confirmar Edición' : 'Confirmar Creación',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            const payload: EventoDificultad = {
                id: this.currentEventoDificultadId !== 0 ? this.currentEventoDificultadId : undefined,
                evento_id: this.eventoId,
                dificultad_id: this.selectedDifficulty!.id,
                isActive: true
            };

            this.loading = true;
            this.message = isEdit ? 'Actualizando dificultad...' : 'Guardando dificultad...';
            try {
                await firstValueFrom(this.eventoService.saveEventoDificultad(payload));
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: isEdit ? 'Dificultad actualizada' : 'Dificultad guardada', life: 3000 });
                this.difficultyDialog = false;
                await this.loadDificultadByEventoId(this.eventoId);
            } catch (err:any) {
                this.messageService.add({ severity: 'warn', summary: 'Error', detail: err.error?.message || 'Error al guardar' });
                console.error(err);
            } finally {
                this.loading = false;
            }
        }
      });
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
