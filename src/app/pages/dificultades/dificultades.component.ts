import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Dificultad } from '../../core/models';
import { EventoService } from '../../core/services/evento.service';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-dificultades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    LoadingOverlayComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './dificultades.component.html'
})
export class DificultadesComponent implements OnInit {
  dificultades: Dificultad[] = [];
  dificultad: Dificultad = this.createEmptyDificultad();
  
  dificultadDialog: boolean = false;
  submitted: boolean = false;
  loading: boolean = false;

  constructor(
    private eventoService: EventoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadDificultades();
  }

  async loadDificultades() {
    this.loading = true;
    try {
      const res = await firstValueFrom(this.eventoService.getDificultades());
      this.dificultades = res.response;
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar dificultades' });
    } finally {
      this.loading = false;
    }
  }

  openNewDificultad() {
    this.dificultad = this.createEmptyDificultad();
    this.submitted = false;
    this.dificultadDialog = true;
  }

  editDificultad(dificultad: Dificultad) {
    this.dificultad = { ...dificultad };
    this.dificultadDialog = true;
  }

  deleteDificultad(dificultad: Dificultad) {
    this.confirmationService.confirm({
      key: 'dificultadesConfirm',
      message: '¿Estás seguro de que deseas eliminar ' + dificultad.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.loading = true;
        try {
          await firstValueFrom(this.eventoService.deleteDificultad(dificultad.id));
          this.loadDificultades();
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad eliminada', life: 3000 });
        } catch (err) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar dificultad' });
        } finally {
          this.loading = false;
        }
      }
    });
  }

  async saveDificultad() {
    this.submitted = true;

    if (this.dificultad.nombre?.trim()) {
      this.loading = true;
      try {
        await firstValueFrom(this.eventoService.saveDificultad(this.dificultad));
        this.loadDificultades();
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Dificultad guardada', life: 3000 });
        this.dificultadDialog = false;
        this.dificultad = this.createEmptyDificultad();
      } catch (err) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar dificultad' });
      } finally {
        this.loading = false;
      }
    }
  }

  hideDialog() {
    this.dificultadDialog = false;
    this.submitted = false;
  }

  createEmptyDificultad(): Dificultad {
    return {
      id: 0,
      nombre: '',
      isActive: true
    };
  }
}
