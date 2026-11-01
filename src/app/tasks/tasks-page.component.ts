import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, finalize, map, of, startWith, switchMap } from 'rxjs';
import { TaskFilterComponent } from './components/task-filter.component';
import { TaskFormComponent } from './components/task-form.component';
import { TaskListComponent } from './components/task-list.component';
import { ApiError, StatusFilter, Task, TaskPayload } from './task.model';
import { TaskService } from './task.service';

interface LoadState {
  loading: boolean;
  error: string | null;
  tasks: Task[];
}

/** Composant « conteneur » : orchestre le service et les composants de présentation. */
@Component({
  selector: 'app-tasks-page',
  imports: [AsyncPipe, TaskFilterComponent, TaskListComponent, TaskFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page">
      <header class="head">
        <h1>Mes tâches</h1>
        <button type="button" class="btn primary" (click)="openCreate()">+ Nouvelle tâche</button>
      </header>

      @if (vm$ | async; as vm) {
        <app-task-filter [current]="vm.filter" [counts]="vm.counts" (changed)="filter$.next($event)" />

        @if (actionError(); as msg) {
          <p class="banner" role="alert">
            {{ msg }}
            <button type="button" class="btn small" (click)="actionError.set(null)">Fermer</button>
          </p>
        }

        @if (vm.loading) {
          <div class="state" role="status"><span class="spinner"></span> Chargement des tâches…</div>
        } @else if (vm.error) {
          <div class="state error" role="alert">
            <p>{{ vm.error }}</p>
            <button type="button" class="btn" (click)="reload()">Réessayer</button>
          </div>
        } @else if (vm.visible.length === 0) {
          <div class="state">
            @if (vm.filter === 'ALL') {
              <p>Aucune tâche pour le moment. Créez la première avec « Nouvelle tâche ».</p>
            } @else {
              <p>Aucune tâche avec ce statut.</p>
            }
          </div>
        } @else {
          <app-task-list [tasks]="vm.visible" [deletingId]="deletingId()" (edit)="openEdit($event)" (remove)="remove($event)" />
        }
      }

      @if (formOpen()) {
        <app-task-form [task]="editing()" [saving]="saving()" [error]="formError()"
          (saved)="save($event)" (cancelled)="closeForm()" />
      }
    </main>
  `,
  styles: `
    .page { max-width: 1100px; margin: 0 auto; padding: 32px 16px; display: flex; flex-direction: column; gap: 20px; }
    .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    h1 { margin: 0; font-size: 2rem; }
    .state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 16px;
      color: var(--muted); background: var(--surface); border: 1px dashed var(--border); border-radius: 12px; }
    .state:has(.spinner) { flex-direction: row; justify-content: center; }
    .state p { margin: 0; }
    .state.error { color: var(--danger); border-color: var(--danger); }
    .banner { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 0;
      padding: 10px 14px; border-radius: 8px; color: var(--danger); background: #fdecec; border: 1px solid var(--danger); }
  `,
})
export class TasksPageComponent {
  private readonly api = inject(TaskService);

  /* ---------- Flux RxJS : chargement + filtre ---------- */

  private readonly reload$ = new BehaviorSubject<void>(undefined);
  protected readonly filter$ = new BehaviorSubject<StatusFilter>('ALL');

  // switchMap annule la requête en cours si on recharge ; startWith émet l'état « loading ».
  private readonly state$: Observable<LoadState> = this.reload$.pipe(
    switchMap(() =>
      this.api.getAll().pipe(
        map((tasks): LoadState => ({ loading: false, error: null, tasks })),
        catchError((e: ApiError) => of<LoadState>({ loading: false, error: e.message, tasks: [] })),
        startWith<LoadState>({ loading: true, error: null, tasks: [] }),
      ),
    ),
  );

  // Le filtre est appliqué côté client : changer de statut ne relance pas d'appel HTTP.
  protected readonly vm$ = combineLatest([this.state$, this.filter$]).pipe(
    map(([state, filter]) => ({
      ...state,
      filter,
      visible: filter === 'ALL' ? state.tasks : state.tasks.filter((t) => t.status === filter),
      counts: countByStatus(state.tasks),
    })),
  );

  /* ---------- État de l'interface (formulaire, suppression) ---------- */

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Task | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  protected reload(): void {
    this.reload$.next();
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(task: Task): void {
    this.editing.set(task);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (!this.saving()) {
      this.formOpen.set(false);
    }
  }

  protected save(payload: TaskPayload): void {
    const current = this.editing();
    const request$ = current ? this.api.update(current.id, payload) : this.api.create(payload);

    this.saving.set(true);
    this.formError.set(null);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.reload();
      },
      error: (e: ApiError) => this.formError.set(e.message),
    });
  }

  protected remove(task: Task): void {
    if (!confirm(`Supprimer la tâche « ${task.title} » ?`)) {
      return;
    }
    this.deletingId.set(task.id);
    this.actionError.set(null);

    this.api
      .remove(task.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.reload(),
        error: (e: ApiError) => this.actionError.set(e.message),
      });
  }
}

function countByStatus(tasks: Task[]): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = { ALL: tasks.length, TODO: 0, IN_PROGRESS: 0, DONE: 0, OVERDUE: 0 };
  for (const t of tasks) {
    counts[t.status]++;
  }
  return counts;
}
