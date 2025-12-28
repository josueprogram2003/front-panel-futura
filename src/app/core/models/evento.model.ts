import { EventoDificultad } from './evento-dificultad.model';

export interface Evento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha?: string | Date;
  isActive: boolean;
  isVisible?: number;
  isPredeterminado?: boolean;
  evento_dificultad?: EventoDificultad[];
}
