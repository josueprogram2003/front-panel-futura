import { Routes } from '@angular/router';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { EventosComponent } from './pages/eventos/eventos.component';
import { EventosDificultadesComponent } from './pages/eventos/dificultades/eventos-dificultades.component';
import { EventosPreguntasComponent } from './pages/eventos/preguntas/eventos-preguntas.component';

export const routes: Routes = [
  { path: '', redirectTo: 'eventos', pathMatch: 'full' },
  { path: 'eventos', component: EventosComponent },
  { path: 'eventos/:id/dificultades', component: EventosDificultadesComponent },
  { path: 'eventos/:id/dificultades/:difficultyId/preguntas', component: EventosPreguntasComponent },
  { path: 'configuracion', component: ConfiguracionComponent }
];
