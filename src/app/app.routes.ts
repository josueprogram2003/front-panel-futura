import { Routes } from '@angular/router';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { EventosComponent } from './pages/eventos/eventos.component';
import { EventosDificultadesComponent } from './pages/eventos/dificultades/eventos-dificultades.component';
import { EventosPreguntasComponent } from './pages/eventos/preguntas/eventos-preguntas.component';
import { DificultadesComponent } from './pages/dificultades/dificultades.component';
import { BienvenidosComponent } from './pages/bienvenidos/bienvenidos.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: 'panel',
    children: [
      { path: '', redirectTo: 'bienvenidos', pathMatch: 'full' },
      
      { path: 'bienvenidos', component: BienvenidosComponent },
      { path: 'eventos', component: EventosComponent },
      { path: 'eventos/:id/dificultades', component: EventosDificultadesComponent },
      { path: 'eventos/:id/dificultades/:difficultyId/preguntas', component: EventosPreguntasComponent },
      { path: 'dificultades', component: DificultadesComponent },
      { path: 'configuracion', component: ConfiguracionComponent }
    ]
  },
  { path: '', redirectTo: 'panel/bienvenidos', pathMatch: 'full' }
];
