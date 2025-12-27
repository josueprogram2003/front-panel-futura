import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Configuracion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getConfiguracion(): Observable<ApiResponse<Configuracion>> {
    return this.http.get<ApiResponse<Configuracion>>(`${this.apiUrl}/configuracion`);
  }

  updateFotoConfig(data: { isActiveImpresora: boolean, isActive?: boolean }): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/configuracion/foto`, data);
  }

  updateTriviaConfig(data: { 
    text_color_pregunta: string; 
    text_color_alternativa: string; 
    color_boton_alternativa: string; 
    color_letra_alternativa: string; 
    color_numeracion: string; 
  }): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/configuracion/trivia`, data);
  }
}
