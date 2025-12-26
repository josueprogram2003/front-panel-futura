import { EventoDificultad } from './evento-dificultad.model';

export interface Evento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha?: string; // Using string for date to match typical JSON/Input date format
  isActive: boolean;

  // Navigation property
  evento_dificultad?: EventoDificultad[];
}
