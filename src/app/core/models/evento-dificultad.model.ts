import { Dificultad } from './dificultad.model';
import { Evento } from './evento.model';

export interface EventoDificultad {
  id?: number;
  evento_id: number;
  dificultad_id: number;
  isActive: boolean;
}

export interface EventoDificultadList {
  id: number;
  evento: Evento;
  dificultad: Dificultad;
  cantidad_preguntas:number;
}