import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

interface Alternative {
  opcion: string;
  texto: string;
  respuesta_correcta: boolean;
}

interface Question {
  id: number;
  tipo: string;
  pregunta: string;
  alternativas: Alternative[];
}

interface Evento {
  id: number;
  nombre: string;
  fecha: string;
  descripcion: string;
  preguntas: Question[];
}

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
    ConfirmDialogModule,
    DropdownModule,
    CheckboxModule,
    RadioButtonModule,
    TagModule
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
  selectedEvent: Evento | null = null;
  
  // Dialog states
  eventDialog: boolean = false;
  questionDialog: boolean = false;
  
  // Form data
  evento: Evento = this.createEmptyEvent();
  pregunta: Question = this.createEmptyQuestion();
  
  submitted: boolean = false;
  submittedQuestion: boolean = false;
  viewQuestions: boolean = false;

  tiposPregunta = [
    { label: 'Alternativa Múltiple', value: 'alternativa' },
    { label: 'Verdadero/Falso', value: 'vf' }
  ];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    // Initial mock data based on user input
    this.eventos = [
      {
        id: 1,
        nombre: 'Concurso de Conocimientos Generales',
        fecha: '2025-07-28',
        descripcion: 'Evento principal por Fiestas Patrias',
        preguntas: [] // Will be populated with the user's JSON example if needed, or kept empty
      }
    ];

    // Populate the first event with the user's provided questions for demonstration
    this.eventos[0].preguntas = [
      { 
        "id": 1, 
        "tipo": "alternativa", 
        "pregunta": "¿Cuál es la capital del Perú?", 
        "alternativas": [ 
          { "opcion": "A", "texto": "Cusco", "respuesta_correcta": false }, 
          { "opcion": "B", "texto": "Arequipa", "respuesta_correcta": false }, 
          { "opcion": "C", "texto": "Lima", "respuesta_correcta": true }, 
          { "opcion": "D", "texto": "Trujillo", "respuesta_correcta": false } 
        ] 
      }, 
      // ... (Add more if needed, but one is enough for demo)
    ];
  }

  // --- EVENT MANAGEMENT ---

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
        this.eventos = this.eventos.filter(val => val.id !== evento.id);
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
      if (this.evento.id) {
        const index = this.eventos.findIndex(e => e.id === this.evento.id);
        this.eventos[index] = this.evento;
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Evento actualizado', life: 3000 });
      } else {
        this.evento.id = this.createId();
        this.eventos.push(this.evento);
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Evento creado', life: 3000 });
      }

      this.eventos = [...this.eventos];
      this.eventDialog = false;
      this.evento = this.createEmptyEvent();
    }
  }

  // --- QUESTION MANAGEMENT ---

  manageQuestions(evento: Evento) {
    this.selectedEvent = evento;
    this.viewQuestions = true;
  }

  closeQuestions() {
    this.viewQuestions = false;
    this.selectedEvent = null;
  }

  openNewQuestion() {
    this.pregunta = this.createEmptyQuestion();
    this.submittedQuestion = false;
    this.questionDialog = true;
  }

  editQuestion(pregunta: Question) {
    this.pregunta = JSON.parse(JSON.stringify(pregunta)); // Deep copy
    this.questionDialog = true;
  }

  deleteQuestion(pregunta: Question) {
    if (!this.selectedEvent) return;
    
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar esta pregunta?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedEvent) {
            this.selectedEvent.preguntas = this.selectedEvent.preguntas.filter(val => val.id !== pregunta.id);
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Pregunta eliminada', life: 3000 });
        }
      }
    });
  }

  hideQuestionDialog() {
    this.questionDialog = false;
    this.submittedQuestion = false;
  }

  saveQuestion() {
    this.submittedQuestion = true;

    if (this.pregunta.pregunta?.trim() && this.selectedEvent) {
      if (this.pregunta.id) {
        const index = this.selectedEvent.preguntas.findIndex(q => q.id === this.pregunta.id);
        this.selectedEvent.preguntas[index] = this.pregunta;
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Pregunta actualizada', life: 3000 });
      } else {
        this.pregunta.id = this.createId();
        this.selectedEvent.preguntas.push(this.pregunta);
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Pregunta creada', life: 3000 });
      }

      this.questionDialog = false;
      this.pregunta = this.createEmptyQuestion();
    }
  }

  onTypeChange() {
    if (this.pregunta.tipo === 'vf') {
      this.pregunta.alternativas = [
        { opcion: 'A', texto: 'Verdadero', respuesta_correcta: true },
        { opcion: 'B', texto: 'Falso', respuesta_correcta: false }
      ];
    } else {
      // Reset to default 4 options for multiple choice
      this.pregunta.alternativas = [
        { opcion: 'A', texto: '', respuesta_correcta: false },
        { opcion: 'B', texto: '', respuesta_correcta: false },
        { opcion: 'C', texto: '', respuesta_correcta: false },
        { opcion: 'D', texto: '', respuesta_correcta: false }
      ];
    }
  }

  // --- ALTERNATIVES MANAGEMENT ---

  addAlternative() {
    if (this.pregunta.tipo === 'vf') return;

    const options = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextOption = options[this.pregunta.alternativas.length] || '?';
    
    this.pregunta.alternativas.push({
      opcion: nextOption,
      texto: '',
      respuesta_correcta: false
    });
  }

  removeAlternative(index: number) {
    if (this.pregunta.tipo === 'vf') return;

    this.pregunta.alternativas.splice(index, 1);
    // Re-label options
    const options = ['A', 'B', 'C', 'D', 'E', 'F'];
    this.pregunta.alternativas.forEach((alt, i) => {
      alt.opcion = options[i] || '?';
    });
  }

  // --- HELPERS ---

  createEmptyEvent(): Evento {
    return {
      id: 0,
      nombre: '',
      fecha: '',
      descripcion: '',
      preguntas: []
    };
  }

  createEmptyQuestion(): Question {
    return {
      id: 0,
      tipo: 'alternativa',
      pregunta: '',
      alternativas: [
        { opcion: 'A', texto: '', respuesta_correcta: false },
        { opcion: 'B', texto: '', respuesta_correcta: false },
        { opcion: 'C', texto: '', respuesta_correcta: false },
        { opcion: 'D', texto: '', respuesta_correcta: false }
      ]
    };
  }

  createId(): number {
    return Math.floor(Math.random() * 10000);
  }
}
