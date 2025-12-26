import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Evento, EventoDificultad, Dificultad, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Eventos
  getEventos(): Observable<Evento[]> {
    return this.http.get<ApiResponse<Evento[]>>(`${this.apiUrl}/eventos`)
      .pipe(map(res => res.response));
  }

  getEventoById(id: number): Observable<Evento> {
    return this.http.get<ApiResponse<Evento>>(`${this.apiUrl}/eventos/${id}`)
      .pipe(map(res => res.response));
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
  getDificultades(): Observable<Dificultad[]> {
    return this.http.get<ApiResponse<Dificultad[]>>(`${this.apiUrl}/dificultades`)
      .pipe(map(res => res.response));
  }

  saveDificultad(dificultad: Dificultad): Observable<Dificultad> {
    if (dificultad.id && dificultad.id !== 0) {
      return this.http.put<ApiResponse<Dificultad>>(`${this.apiUrl}/dificultades/${dificultad.id}`, dificultad)
        .pipe(map(res => res.response));
    }
    return this.http.post<ApiResponse<Dificultad>>(`${this.apiUrl}/dificultades`, dificultad)
      .pipe(map(res => res.response));
  }

  deleteDificultad(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/dificultades/${id}`)
      .pipe(map(res => res.response));
  }

  // Evento Dificultades (Nested)
  
  getEventoDificultad(eventoId: number, dificultadId: number): Observable<EventoDificultad> {
    return this.http.get<ApiResponse<EventoDificultad>>(`${this.apiUrl}/eventos/${eventoId}/dificultades/${dificultadId}`)
      .pipe(map(res => res.response));
  }

  saveEventoDificultad(eventoId: number, eventoDificultad: EventoDificultad): Observable<EventoDificultad> {
      if (eventoDificultad.id && eventoDificultad.id !== 0) {
          return this.http.put<ApiResponse<EventoDificultad>>(`${this.apiUrl}/eventos/${eventoId}/dificultades/${eventoDificultad.id}`, eventoDificultad)
            .pipe(map(res => res.response));
      }
      return this.http.post<ApiResponse<EventoDificultad>>(`${this.apiUrl}/eventos/${eventoId}/dificultades`, eventoDificultad)
        .pipe(map(res => res.response));
  }

  createId(): number {
    return Math.floor(Math.random() * 10000);
  }
}
