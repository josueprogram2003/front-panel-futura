import { Alternativa } from './alternativa.model';

export interface Pregunta {
  id: number;
  evento_dificultad_id: number;
  tipo: string;
  pregunta: string;
  isActive: boolean;

  // Navigation property
  alternativas?: Alternativa[];
}
