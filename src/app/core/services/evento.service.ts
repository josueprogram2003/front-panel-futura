import { Injectable } from '@angular/core';
import { Evento, EventoDificultad, Pregunta, Dificultad } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private eventos: Evento[] = [];
  private dificultades: Dificultad[] = [];

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    this.dificultades = [
      { id: 1, nombre: 'Fácil', isActive: true },
      { id: 2, nombre: 'Medio', isActive: true },
      { id: 3, nombre: 'Difícil', isActive: true },
      { id: 4, nombre: 'Experto', isActive: true }
    ];

    this.eventos = [
      {
        id: 1,
        nombre: 'Concurso de Conocimientos Generales',
        fecha: '2025-07-28',
        descripcion: 'Evento principal por Fiestas Patrias',
        isActive: true,
        evento_dificultad: [
          {
            id: 1,
            evento_id: 1,
            dificultad_id: 1,
            isActive: true,
            dificultad: {
              id: 1,
              nombre: 'Fácil',
              isActive: true
            },
            preguntas: [
              { 
                id: 1,
                evento_dificultad_id: 1,
                tipo: "alternativa", 
                pregunta: "¿Cuál es la capital del Perú?", 
                isActive: true,
                alternativas: [ 
                  { id: 1, pregunta_id: 1, opcion: "A", texto: "Cusco", respuesta_correcta: false, isActive: true }, 
                  { id: 2, pregunta_id: 1, opcion: "B", texto: "Arequipa", respuesta_correcta: false, isActive: true }, 
                  { id: 3, pregunta_id: 1, opcion: "C", texto: "Lima", respuesta_correcta: true, isActive: true }, 
                  { id: 4, pregunta_id: 1, opcion: "D", texto: "Trujillo", respuesta_correcta: false, isActive: true } 
                ] 
              }
            ]
          }
        ] 
      }
    ];
  }

  getEventos(): Evento[] {
    return this.eventos;
  }

  getDificultades(): Dificultad[] {
    return this.dificultades;
  }

  saveDificultad(dificultad: Dificultad): void {
    if (dificultad.id) {
      const index = this.dificultades.findIndex(d => d.id === dificultad.id);
      if (index !== -1) {
        this.dificultades[index] = dificultad;
      }
    } else {
      dificultad.id = this.createId();
      this.dificultades.push(dificultad);
    }
  }

  deleteDificultad(id: number): void {
    this.dificultades = this.dificultades.filter(d => d.id !== id);
  }

  getEventoById(id: number): Evento | undefined {
    return this.eventos.find(e => e.id === id);
  }

  saveEvento(evento: Evento): void {
    if (evento.id) {
      const index = this.eventos.findIndex(e => e.id === evento.id);
      if (index !== -1) {
        this.eventos[index] = evento;
      }
    } else {
      evento.id = this.createId();
      this.eventos.push(evento);
    }
  }

  deleteEvento(id: number): void {
    this.eventos = this.eventos.filter(e => e.id !== id);
  }

  // Helper methods for deep linking logic
  
  getEventoDificultad(eventoId: number, dificultadId: number): EventoDificultad | undefined {
    const evento = this.getEventoById(eventoId);
    return evento?.evento_dificultad?.find(ed => ed.id === dificultadId);
  }

  updateEventoDificultad(eventoId: number, eventoDificultad: EventoDificultad): void {
    const evento = this.getEventoById(eventoId);
    if (evento && evento.evento_dificultad) {
      const index = evento.evento_dificultad.findIndex(ed => ed.id === eventoDificultad.id);
      if (index !== -1) {
        evento.evento_dificultad[index] = eventoDificultad;
      } else {
        evento.evento_dificultad.push(eventoDificultad);
      }
    }
  }

  createId(): number {
    return Math.floor(Math.random() * 10000);
  }
}
