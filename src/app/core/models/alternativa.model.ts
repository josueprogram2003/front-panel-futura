export interface Alternativa {
  id: number;
  pregunta_id: number;
  opcion: string;
  texto: string;
  respuesta_correcta: boolean;
  isActive: boolean;
}
