import { EventoDificultad } from './evento-dificultad.model';

export interface Evento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha?: string | Date;
  isActive: boolean;

  // Navigation property
  evento_dificultad?: EventoDificultad[];
}
