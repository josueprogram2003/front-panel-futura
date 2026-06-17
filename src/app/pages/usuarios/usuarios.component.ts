import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UsuarioService, Usuario } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay.component';

// ─── Validador de contraseña segura ─────────────────────────────────────────
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

function strongPassword(control: AbstractControl) {
  if (!control.value) return null;
  return PASSWORD_PATTERN.test(control.value) ? null : { weakPassword: true };
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    FormsModule,
    TooltipModule,
    SelectModule,
    ToggleSwitchModule,
    LoadingOverlayComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService    = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmService = inject(ConfirmationService);
  private readonly fb             = inject(FormBuilder);

  // ── Estado ─────────────────────────────────────────────────────────────
  usuarios:       Usuario[] = [];
  loading         = false;
  loadingMsg      = '';

  userDialog      = false;
  passDialog      = false;
  submitted       = false;
  passSubmitted   = false;
  showPassword    = false;
  showPassNew     = false;

  readonly currentUserId = this.authService.currentUser?.id ?? 0;

  // ── Opciones de rol ────────────────────────────────────────────────────
  readonly roles = [
    { label: 'Admin',  value: 'admin'  },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ];

  // ── Formularios ────────────────────────────────────────────────────────
  userForm: FormGroup = this.fb.group({
    id:       [0],
    nombre:   ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPassword]],
    rol:      ['viewer', Validators.required],
  });

  passForm: FormGroup = this.fb.group({
    usuarioId: [0],
    password:  ['', [Validators.required, strongPassword]],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.load();
  }

  // ── Carga ──────────────────────────────────────────────────────────────
  async load(): Promise<void> {
    this.loading    = true;
    this.loadingMsg = 'Cargando usuarios...';
    try {
      this.usuarios = await firstValueFrom(this.usuarioService.getAll());
      this.usuarios = this.usuarios.map((u) => ({ ...u, isActive : u.isActive == 1 ? true : false }));
    } catch {
      this.toast('error', 'Error al cargar usuarios');
    } finally {
      this.loading = false;
    }
  }

  // ── Dialogs ─────────────────────────────────────────────────────────────

  openNew(): void {
    this.userForm.reset({ id: 0, nombre: '', email: '', password: '', rol: 'viewer' });
    this.userForm.get('password')!.setValidators([Validators.required, strongPassword]);
    this.userForm.get('password')!.updateValueAndValidity();
    this.submitted    = false;
    this.showPassword = false;
    this.userDialog   = true;
  }

  editUsuario(u: Usuario): void {
    this.userForm.patchValue({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, password: '' });
    // En edición la contraseña no se toca
    this.userForm.get('password')!.clearValidators();
    this.userForm.get('password')!.updateValueAndValidity();
    this.submitted    = false;
    this.showPassword = false;
    this.userDialog   = true;
  }

  openChangePassword(u: Usuario): void {
    this.passForm.reset({ usuarioId: u.id, password: '' });
    this.passSubmitted = false;
    this.showPassNew   = false;
    this.passDialog    = true;
  }

  hideUserDialog(): void { this.userDialog = false; this.submitted = false; }
  hidePassDialog(): void { this.passDialog = false; this.passSubmitted = false; }

  // ── Save usuario ────────────────────────────────────────────────────────

  async saveUsuario(): Promise<void> {
    this.submitted = true;
    if (this.userForm.invalid) return;

    const v       = this.userForm.value;
    const editing = v.id && v.id !== 0;

    this.confirmService.confirm({
      key:     'usuariosConfirm',
      message: editing
        ? `¿Actualizar los datos de ${v.nombre}?`
        : `¿Crear al usuario ${v.nombre}?`,
      header:  'Confirmar',
      icon:    'pi pi-exclamation-triangle',
      accept:  async () => {
        this.loading    = true;
        this.loadingMsg = editing ? 'Actualizando usuario...' : 'Creando usuario...';
        try {
          if (editing) {
            await firstValueFrom(
              this.usuarioService.update(v.id, { nombre: v.nombre, email: v.email, rol: v.rol })
            );
          } else {
            await firstValueFrom(
              this.usuarioService.create({ nombre: v.nombre, email: v.email, password: v.password, rol: v.rol })
            );
          }
          this.toast('success', editing ? 'Usuario actualizado' : 'Usuario creado');
          this.userDialog = false;
          await this.load();
        } catch (err: any) {
          const msg = err?.error?.message ?? (editing ? 'Error al actualizar' : 'Error al crear usuario');
          this.toast('error', msg);
        } finally {
          this.loading = false;
        }
      },
    });
  }

  // ── Change password ─────────────────────────────────────────────────────

  async savePassword(): Promise<void> {
    this.passSubmitted = true;
    if (this.passForm.invalid) return;

    const { usuarioId, password } = this.passForm.value;
    this.loading    = true;
    this.loadingMsg = 'Cambiando contraseña...';
    try {
      await firstValueFrom(this.usuarioService.changePassword(usuarioId, password));
      this.toast('success', 'Contraseña actualizada');
      this.passDialog = false;
    } catch (err: any) {
      const msg = err?.error?.message ?? 'Error al cambiar contraseña';
      this.toast('error', msg);
    } finally {
      this.loading = false;
    }
  }

  // ── Toggle active ───────────────────────────────────────────────────────

  toggleActive(u: Usuario): void {
    const accion = u.isActive ? 'desactivar' : 'activar';
    this.confirmService.confirm({
      key:     'usuariosConfirm',
      message: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${u.nombre}?`,
      header:  'Confirmar',
      icon:    'pi pi-exclamation-triangle',
      accept:  async () => {
        this.loading    = true;
        this.loadingMsg = `${accion.charAt(0).toUpperCase() + accion.slice(1)}ndo usuario...`;
        try {
          const result   = await firstValueFrom(this.usuarioService.toggleActive(u.id));
          u.isActive     = result.isActive;
          this.toast('success', `Usuario ${result.isActive ? 'activado' : 'desactivado'}`);
        } catch (err: any) {
          const msg = err?.error?.message ?? 'Error al cambiar estado';
          this.toast('error', msg);
        } finally {
          this.loading = false;
        }
      },
    });
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  deleteUsuario(u: Usuario): void {
    this.confirmService.confirm({
      key:     'usuariosConfirm',
      message: `¿Eliminar definitivamente a ${u.nombre}? Esta acción no se puede deshacer.`,
      header:  'Eliminar usuario',
      icon:    'pi pi-trash',
      accept:  async () => {
        this.loading    = true;
        this.loadingMsg = 'Eliminando usuario...';
        try {
          await firstValueFrom(this.usuarioService.remove(u.id));
          this.toast('success', 'Usuario eliminado');
          await this.load();
        } catch (err: any) {
          const msg = err?.error?.message ?? 'Error al eliminar usuario';
          this.toast('error', msg);
        } finally {
          this.loading = false;
        }
      },
    });
  }

  // ── UI helpers ──────────────────────────────────────────────────────────

  get isEditing(): boolean { return !!this.userForm.get('id')?.value; }

  rolSeverity(rol: string): 'info' | 'warn' | 'secondary' {
    return rol === 'admin' ? 'info' : rol === 'editor' ? 'warn' : 'secondary';
  }

  private toast(severity: 'success' | 'error', detail: string): void {
    this.messageService.add({ severity, summary: severity === 'success' ? 'Éxito' : 'Error', detail, life: 3500 });
  }
}
