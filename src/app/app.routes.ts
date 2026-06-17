import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { PanelLayoutComponent } from './layout/panel-layout/panel-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidosComponent } from './pages/bienvenidos/bienvenidos.component';
import { EventosComponent } from './pages/eventos/eventos.component';
import { EventosDificultadesComponent } from './pages/eventos/dificultades/eventos-dificultades.component';
import { EventosPreguntasComponent } from './pages/eventos/preguntas/eventos-preguntas.component';
import { DificultadesComponent } from './pages/dificultades/dificultades.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  // Ruta pública — solo accesible sin sesión
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },

  // Rutas protegidas — el layout es el shell con sidebar
  {
    path: 'panel',
    component: PanelLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '',            redirectTo: 'bienvenidos', pathMatch: 'full' },
      { path: 'bienvenidos', component: BienvenidosComponent },
      { path: 'eventos',     component: EventosComponent },
      { path: 'eventos/:id/dificultades',                         component: EventosDificultadesComponent },
      { path: 'eventos/:id/dificultades/:difficultyId/preguntas', component: EventosPreguntasComponent },
      { path: 'dificultades', component: DificultadesComponent },
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'usuarios',      component: UsuariosComponent },
    ],
  },

  { path: '',   redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
