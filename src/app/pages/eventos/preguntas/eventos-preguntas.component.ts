import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  difficultyName: string = '';
  newQuestionsBuffer: Pregunta[] = [];
  isPredeterminado: boolean | null = null;

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
        const state = history.state;
        if (state) {
            if (state.difficultyName) this.difficultyName = state.difficultyName;
            if (state.eventName) {
                this.evento = { id: this.eventoId, nombre: state.eventName, isActive: true, descripcion: '' };
            }
            if (state.isPredeterminado !== undefined) {
                this.isPredeterminado = state.isPredeterminado;
            }
        }
        console.log('Evento isPredeterminado:', this.evento);
        console.log(this.isPredeterminado);
        this.loadData();
      }
    });
  }

  async loadData() {
    this.loading = true;
    try {
      if (this.isPredeterminado) {
         this.preguntas = await firstValueFrom(this.eventoService.getPreguntasByEventoIdCompleto(this.eventoId)).then(res => res.response);
      } else {
         this.preguntas = await firstValueFrom(this.eventoService.getEventosDificultadesPreguntasByEventoDificultadId(this.dificultadEventoId)).then(res => res.response);
      }

      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar datos' });
      console.error(err);
    }
  }

  openNewQuestion() {
    this.pregunta = this.createEmptyQuestion();
    this.newQuestionsBuffer = [];
    this.submitted = false;
    this.questionDialog = true;
  }

  editQuestion(pregunta: Pregunta) {
    this.pregunta = JSON.parse(JSON.stringify(pregunta));
    if (this.pregunta.alternativas) {
        this.pregunta.alternativas.forEach(alt => {
            // @ts-ignore
            alt.respuesta_correcta = alt.respuesta_correcta === 1 || alt.respuesta_correcta === '1' || alt.respuesta_correcta === true;
        });
    }

    this.newQuestionsBuffer = [];
    this.questionDialog = true;
  }

  deleteQuestion(pregunta: Pregunta) {
    this.confirmationService.confirm({
      key: 'eventosPreguntasConfirm',
      message: '¿Estás seguro de eliminar esta pregunta?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.loading = true;
        try {
          await firstValueFrom(this.eventoService.deletePregunta(pregunta.id));
          
          if (this.eventoDificultad && this.eventoDificultad.preguntas) {
            this.eventoDificultad.preguntas = this.eventoDificultad.preguntas.filter(val => val.id !== pregunta.id);
            this.preguntas = [...this.eventoDificultad.preguntas];
          }
          
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Pregunta eliminada', life: 3000 });
          this.loadData();
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar pregunta' });
        } finally {
          this.loading = false;
        }
      }
    });
  }

  hideDialog() {
    this.questionDialog = false;
    this.submitted = false;
  }

  hasCorrectAnswer(): boolean {
    if (!this.pregunta.alternativas) return false;
    return this.pregunta.alternativas.some(a => a.respuesta_correcta);
  }

  validateQuestion(): boolean {
    if (!this.pregunta.pregunta?.trim()) {
      return false;
    }

    if (!this.pregunta.alternativas || this.pregunta.alternativas.length === 0) {
      return false;
    }

    if (this.pregunta.tipo === 'alternativa') {
        const invalidAlt = this.pregunta.alternativas.some(alt => !alt.texto?.trim());
        if (invalidAlt) return false;
    }

    const hasCorrect = this.pregunta.alternativas.some(alt => alt.respuesta_correcta);
    if (!hasCorrect) return false;

    return true;
  }

  addToBuffer() {
    this.submitted = true;
    if (this.validateQuestion()) {
        this.pregunta.evento_dificultad_id = this.dificultadEventoId;
        if (this.evento?.isPredeterminado) {
          this.pregunta.evento_id = this.eventoId;
        }
        console.log('Adding to buffer:', this.pregunta);
        this.newQuestionsBuffer.push({...this.pregunta});
        console.log('Buffer now:', this.newQuestionsBuffer);
        this.pregunta = this.createEmptyQuestion();
        this.submitted = false;
        this.messageService.add({ severity: 'info', summary: 'Agregada', detail: 'Pregunta agregada a la lista para guardar' });
    } else {
        this.messageService.add({ severity: 'warn', summary: 'Incompleto', detail: 'Complete todos los campos requeridos y seleccione una respuesta correcta.' });
    }
  }

  removeFromBuffer(index: number) {
      this.newQuestionsBuffer.splice(index, 1);
  }

  editFromBuffer(index: number) {
      if (this.validateQuestion()) {
          this.addToBuffer();
      }  
      const questionToEdit = this.newQuestionsBuffer[index];
      this.newQuestionsBuffer.splice(index, 1);
      this.pregunta = { ...questionToEdit };
  }

  saveQuestion() {
    this.submitted = true;
    const isCurrentValid = this.validateQuestion();
    const isCurrentEmpty = !this.pregunta.pregunta?.trim(); 
    if (!isCurrentValid && !isCurrentEmpty) {
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La pregunta actual está incompleta. Complétela o bórrela antes de guardar.' });
        return;
    }
    const hasCurrent = isCurrentValid;
    const hasBuffer = this.newQuestionsBuffer.length > 0;
    if (hasCurrent || hasBuffer) {
      const isEdit = this.pregunta.id !== 0;
      this.confirmationService.confirm({
        key: 'eventosPreguntasConfirm',
        message: isEdit ? '¿Estás seguro de actualizar esta pregunta?' : `¿Estás seguro de crear ${this.newQuestionsBuffer.length + (hasCurrent ? 1 : 0)} preguntas?`,
        header: isEdit ? 'Confirmar Edición' : 'Confirmar Creación Masiva',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            this.loading = true;
            this.message = isEdit ? 'Actualizando pregunta...' : 'Guardando preguntas...';
            try {
                this.pregunta.evento_dificultad_id = this.dificultadEventoId;
                if (isEdit) {
                  if (this.isPredeterminado) {
                      this.pregunta.evento_id = this.eventoId;
                  }
                    await firstValueFrom(this.eventoService.updatePreguntaCompleto(this.pregunta));
                    if (this.eventoDificultad?.preguntas) {
                        const index = this.eventoDificultad.preguntas.findIndex(q => q.id === this.pregunta.id);
                        if (index !== -1) {
                            this.eventoDificultad.preguntas[index] = this.pregunta;
                        }
                    }
                } else {
                    const questionsToSave = [...this.newQuestionsBuffer];
                    if (hasCurrent) {
                        questionsToSave.push(this.pregunta);
                    }

                    console.log(this.evento?.isPredeterminado);
                    if(questionsToSave.length === 1 && this.isPredeterminado) {
                      questionsToSave[0].evento_id = this.eventoId;
                    }
                    const res = await firstValueFrom(this.eventoService.insertPreguntasMasivo(questionsToSave));
                    const savedQuestions = res.response;

                    if (savedQuestions && Array.isArray(savedQuestions)) {
                         this.preguntas = [...this.preguntas, ...savedQuestions];
                    }
                }
                
                if (isEdit) {
                     this.preguntas = [...(this.eventoDificultad?.preguntas || [])];
                }

                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: isEdit ? 'Pregunta actualizada' : 'Preguntas creadas', life: 3000 });
                
                // Always reload data to ensure consistency and handle cases where response is null
                await this.loadData();

                this.questionDialog = false;
                this.pregunta = this.createEmptyQuestion();
                this.newQuestionsBuffer = [];
            } catch (error) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar preguntas' });
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
      });
    }
  }

  saveChanges() {
    // Deprecated: using specific service methods now
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

  onCorrectAnswerChange(index: number) {
    if (this.pregunta.alternativas) {
        this.pregunta.alternativas.forEach((alt, i) => {
            if (i !== index) {
                alt.respuesta_correcta = false;
            }
        });
    }
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
