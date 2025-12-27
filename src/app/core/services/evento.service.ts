import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Evento, EventoDificultad, Dificultad, ApiResponse, EventoDificultadList, Pregunta } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Eventos
  getEventos(): Observable<ApiResponse<Evento[]>> {
    return this.http.get<ApiResponse<Evento[]>>(`${this.apiUrl}/eventos`);
  }

  getEventoById(id: number): Observable<ApiResponse<Evento>> {
    return this.http.get<ApiResponse<Evento>>(`${this.apiUrl}/eventos/${id}`);
  }

  saveEvento(evento: Evento): Observable<ApiResponse<Evento>> {
    if (evento.id && evento.id !== 0) {
      return this.http.put<ApiResponse<Evento>>(`${this.apiUrl}/eventos/${evento.id}`, evento);
    }
    return this.http.post<ApiResponse<Evento>>(`${this.apiUrl}/eventos`, evento);
  }

  deleteEvento(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/eventos/${id}`);
  }

  // Dificultades Globales
  getDificultades(): Observable<ApiResponse<Dificultad[]>> {
    return this.http.get<ApiResponse<Dificultad[]>>(`${this.apiUrl}/dificultades`);
  }

  saveDificultad(dificultad: Dificultad): Observable<ApiResponse<Dificultad>> {
    if (dificultad.id && dificultad.id !== 0) {
      return this.http.put<ApiResponse<Dificultad>>(`${this.apiUrl}/dificultades/${dificultad.id}`, dificultad);
    }
    return this.http.post<ApiResponse<Dificultad>>(`${this.apiUrl}/dificultades`, dificultad);
  }

  deleteDificultad(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/dificultades/${id}`);
  }

  // Evento Dificultades (Nested)
  
  getEventosDificultadesByEventoId(eventoId: number): Observable<ApiResponse<EventoDificultadList[]>> {
    return this.http.get<ApiResponse<EventoDificultadList[]>>(`${this.apiUrl}/evento-dificultad/${eventoId}`);
  }


  getEventosDificultadesPreguntasByEventoDificultadId(eventoDificultadId: number): Observable<ApiResponse<Pregunta[]>> {
    return this.http.get<ApiResponse<Pregunta[]>>(`${this.apiUrl}/evento-dificultad/${eventoDificultadId}/preguntas`);
  }

  saveEventoDificultad(eventoDificultad: EventoDificultad): Observable<ApiResponse<EventoDificultad>> {
      if (eventoDificultad.id && eventoDificultad.id !== 0) {
          return this.http.put<ApiResponse<EventoDificultad>>(`${this.apiUrl}/evento-dificultad/${eventoDificultad.id}`, eventoDificultad);
      }
      return this.http.post<ApiResponse<EventoDificultad>>(`${this.apiUrl}/evento-dificultad`, eventoDificultad);
  }

  deleteEventoDificultad(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/evento-dificultad/${id}`);
  }

  getPreguntasByEventoDificultadId(id: number): Observable<ApiResponse<EventoDificultad>> {
    return this.http.get<ApiResponse<EventoDificultad>>(`${this.apiUrl}/evento-dificultad/${id}/preguntas`);
  }

  savePregunta(pregunta: Pregunta): Observable<ApiResponse<Pregunta>> {
    if (pregunta.id && pregunta.id !== 0) {
      return this.http.put<ApiResponse<Pregunta>>(`${this.apiUrl}/preguntas/${pregunta.id}`, pregunta);
    }
    return this.http.post<ApiResponse<Pregunta>>(`${this.apiUrl}/preguntas`, pregunta);
  }

  updatePreguntasMasivo(preguntas: Pregunta[]): Observable<ApiResponse<Pregunta[]>> {
    return this.http.put<ApiResponse<Pregunta[]>>(`${this.apiUrl}/preguntas/update/masivo`, preguntas);
  }

  insertPreguntasMasivo(preguntas: Pregunta[]): Observable<ApiResponse<Pregunta[]>> {
    return this.http.post<ApiResponse<Pregunta[]>>(`${this.apiUrl}/preguntas/create/masivo`, preguntas);
  }

  deletePregunta(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/preguntas/${id}`);
  }

  createId(): number {
    return Math.floor(Math.random() * 10000);
  }
}
