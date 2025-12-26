import { Dificultad } from './dificultad.model';
import { Pregunta } from './pregunta.model';

export interface EventoDificultad {
  id: number;
  evento_id: number;
  dificultad_id: number;
  isActive: boolean;

  // Navigation properties
  dificultad?: Dificultad;
  preguntas?: Pregunta[];
}
