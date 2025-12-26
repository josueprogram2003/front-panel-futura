export interface Configuracion {
  id: number;
  isActive: boolean;
  isActiveImpresora: boolean;
  text_color_pregunta?: string;
  text_color_alternativa?: string;
  color_boton_alternativa?: string;
  color_letra_alternativa?: string;
  color_numeracion?: string;
  preguntas_por_ronda?: number;
  preguntas_para_ganar?: number;
}
