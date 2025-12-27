import { Dificultad } from './dificultad.model';
import { Evento } from './evento.model';
import { Pregunta } from './pregunta.model';

export interface EventoDificultad {
  id?: number;
  evento_id: number;
  dificultad_id: number;
  isActive: boolean;
  preguntas?: Pregunta[];
}

export interface EventoDificultadList {
  id: number;
  evento: Evento;
  dificultad: Dificultad;
  cantidad_preguntas:number;
}