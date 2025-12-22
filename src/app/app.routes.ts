import { Routes } from '@angular/router';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { EventosComponent } from './pages/eventos/eventos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'eventos', pathMatch: 'full' },
  { path: 'eventos', component: EventosComponent },
  { path: 'configuracion', component: ConfiguracionComponent }
];
