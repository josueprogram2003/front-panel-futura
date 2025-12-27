import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Evento, EventoDificultad, Pregunta } from '../../../core/models';
import { EventoService } from '../../../core/services/evento.service';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-eventos-preguntas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    CheckboxModule,
    TagModule,
    LoadingOverlayComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './eventos-preguntas.component.html'
})
export class EventosPreguntasComponent implements OnInit {
  eventoId!: number;
  dificultadEventoId!: number;
  evento: Evento | undefined;
  eventoDificultad: EventoDificultad | undefined;
  preguntas: Pregunta[] = [];
  questionDialog: boolean = false;
  pregunta: Pregunta = this.createEmptyQuestion();
  submitted: boolean = false;
  loading: boolean = false;
  message: string = '';

  tiposPregunta = [
    { label: 'Alternativa Múltiple', value: 'alternativa' },
    { label: 'Verdadero/Falso', value: 'vf' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const eId = params.get('id');
      const dId = params.get('difficultyId');
      
      if (eId && dId) {
        this.eventoId = +eId;
        this.dificultadEventoId = +dId;
        this.loadData();
      }
    });
  }

  async loadData() {
    this.loading = true;
    try {
      const [resEvento, resPreguntas] = await firstValueFrom(forkJoin([
        this.eventoService.getEventoById(this.eventoId),
        this.eventoService.getEventosDificultadesPreguntasByEventoDificultadId(this.dificultadEventoId)
      ]));
      this.evento = resEvento.response;
      this.preguntas = resPreguntas.response;
      if (!this.evento) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Evento no encontrado' });
        this.router.navigate(['/eventos', this.eventoId, 'dificultades']);
        return;
      }
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar datos' });
      this.router.navigate(['/eventos', this.eventoId, 'dificultades']);
      console.error(err);
    }
  }

  openNewQuestion() {
    this.pregunta = this.createEmptyQuestion();
    this.submitted = false;
    this.questionDialog = true;
  }

  editQuestion(pregunta: Pregunta) {
    this.pregunta = JSON.parse(JSON.stringify(pregunta));
    this.questionDialog = true;
  }

  deleteQuestion(pregunta: Pregunta) {
    this.confirmationService.confirm({
      key: 'eventosPreguntasConfirm',
      message: '¿Estás seguro de eliminar esta pregunta?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (this.eventoDificultad && this.eventoDificultad.preguntas) {
          const previousPreguntas = [...this.eventoDificultad.preguntas];
          this.eventoDificultad.preguntas = this.eventoDificultad.preguntas.filter(val => val.id !== pregunta.id);
          
          try {
            await this.saveChanges();
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Pregunta eliminada', life: 3000 });
          } catch (error) {
            this.eventoDificultad.preguntas = previousPreguntas;
          }
        }
      }
    });
  }

  hideDialog() {
    this.questionDialog = false;
    this.submitted = false;
  }

  saveQuestion() {
    this.submitted = true;

    if (this.pregunta.pregunta?.trim() && this.eventoDificultad) {
      const isEdit = this.pregunta.id !== 0;
      
      this.confirmationService.confirm({
        key: 'eventosPreguntasConfirm',
        message: isEdit ? '¿Estás seguro de actualizar esta pregunta?' : '¿Estás seguro de crear esta pregunta?',
        header: isEdit ? 'Confirmar Edición' : 'Confirmar Creación',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            if (!this.eventoDificultad!.preguntas) {
                this.eventoDificultad!.preguntas = [];
            }

            if (this.pregunta.id) {
                const index = this.eventoDificultad!.preguntas.findIndex(q => q.id === this.pregunta.id);
                if (index !== -1) {
                    this.eventoDificultad!.preguntas[index] = this.pregunta;
                }
            } else {
                this.pregunta.id = this.eventoService.createId();
                this.pregunta.evento_dificultad_id = this.eventoDificultad!.id!;
                this.eventoDificultad!.preguntas.push(this.pregunta);
            }

            this.loading = true;
            this.message = isEdit ? 'Actualizando pregunta...' : 'Guardando pregunta...';
            
            try {
                await this.saveChanges();
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: isEdit ? 'Pregunta actualizada' : 'Pregunta creada', life: 3000 });
                this.questionDialog = false;
                this.pregunta = this.createEmptyQuestion();
            } catch (error) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar pregunta' });
            } finally {
                this.loading = false;
            }
        }
      });
    }
  }

  async saveChanges() {
    if (this.eventoDificultad && this.evento) {
        try {
            await firstValueFrom(this.eventoService.saveEventoDificultad(this.eventoDificultad));
        } catch (err) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar cambios' });
        }
    }
  }

  onTypeChange() {
    if (!this.pregunta.alternativas) {
        this.pregunta.alternativas = [];
    }

    if (this.pregunta.tipo === 'vf') {
      this.pregunta.alternativas = [
        { id: 0, pregunta_id: this.pregunta.id, opcion: 'A', texto: 'Verdadero', respuesta_correcta: true, isActive: true },
        { id: 0, pregunta_id: this.pregunta.id, opcion: 'B', texto: 'Falso', respuesta_correcta: false, isActive: true }
      ];
    } else {
      this.pregunta.alternativas = [
        { id: 0, pregunta_id: this.pregunta.id, opcion: 'A', texto: '', respuesta_correcta: false, isActive: true },
        { id: 0, pregunta_id: this.pregunta.id, opcion: 'B', texto: '', respuesta_correcta: false, isActive: true },
        { id: 0, pregunta_id: this.pregunta.id, opcion: 'C', texto: '', respuesta_correcta: false, isActive: true },
        { id: 0, pregunta_id: this.pregunta.id, opcion: 'D', texto: '', respuesta_correcta: false, isActive: true }
      ];
    }
  }

  addAlternative() {
    if (this.pregunta.tipo === 'vf') return;
    
    if (!this.pregunta.alternativas) {
        this.pregunta.alternativas = [];
    }

    const options = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextOption = options[this.pregunta.alternativas.length] || '?';
    
    this.pregunta.alternativas.push({
      id: 0,
      pregunta_id: this.pregunta.id,
      opcion: nextOption,
      texto: '',
      respuesta_correcta: false,
      isActive: true
    });
  }

  removeAlternative(index: number) {
    if (this.pregunta.tipo === 'vf') return;
    if (!this.pregunta.alternativas) return;

    this.pregunta.alternativas.splice(index, 1);
    const options = ['A', 'B', 'C', 'D', 'E', 'F'];
    this.pregunta.alternativas.forEach((alt, i) => {
      alt.opcion = options[i] || '?';
    });
  }

  createEmptyQuestion(): Pregunta {
    return {
      id: 0,
      evento_dificultad_id: this.dificultadEventoId,
      tipo: 'alternativa',
      pregunta: '',
      isActive: true,
      alternativas: [
        { id: 0, pregunta_id: 0, opcion: 'A', texto: '', respuesta_correcta: false, isActive: true },
        { id: 0, pregunta_id: 0, opcion: 'B', texto: '', respuesta_correcta: false, isActive: true },
        { id: 0, pregunta_id: 0, opcion: 'C', texto: '', respuesta_correcta: false, isActive: true },
        { id: 0, pregunta_id: 0, opcion: 'D', texto: '', respuesta_correcta: false, isActive: true }
      ]
    };
  }
}
