import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PRIORITIES, PRIORITY_LABELS, Priority, STATUSES, STATUS_LABELS, Status, Task, TaskPayload } from '../task.model';

/** Composant de présentation : il ne connaît ni le service ni l'API. */
@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cancelled.emit()' },
  template: `
    <div class="backdrop" (click)="cancelled.emit()">
      <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="form-title"
        [formGroup]="form" (ngSubmit)="submit()" (click)="$event.stopPropagation()" novalidate>
        <h2 id="form-title">{{ task() ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>

        <div class="field">
          <label for="title">Titre</label>
          <input id="title" formControlName="title" maxlength="255"
            [class.invalid]="title.touched && title.invalid" />
          @if (title.touched && title.hasError('required')) {
            <p class="field-error">Le titre est obligatoire.</p>
          }
        </div>

        <div class="field">
          <label for="description">Description</label>
          <textarea id="description" rows="3" formControlName="description" maxlength="1000"></textarea>
        </div>

        <div class="row">
          <div class="field">
            <label for="status">Statut</label>
            <select id="status" formControlName="status">
              @for (s of statuses; track s) { <option [value]="s">{{ statusLabels[s] }}</option> }
            </select>
          </div>
          <div class="field">
            <label for="priority">Priorité</label>
            <select id="priority" formControlName="priority">
              @for (p of priorities; track p) { <option [value]="p">{{ priorityLabels[p] }}</option> }
            </select>
          </div>
        </div>

        @if (error(); as msg) {
          <p class="field-error" role="alert">{{ msg }}</p>
        }

        <div class="actions">
          <button type="button" class="btn" (click)="cancelled.emit()" [disabled]="saving()">Annuler</button>
          <button type="submit" class="btn primary" [disabled]="saving()">
            {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; background: rgba(17, 24, 39, .45);
      display: grid; place-items: center; padding: 16px; z-index: 10; }
    .dialog { width: min(480px, 100%); max-height: 100%; overflow: auto; padding: 24px;
      background: var(--surface); border-radius: 12px; }
    h2 { margin: 0 0 16px; font-size: 1.25rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  `,
})
export class TaskFormComponent implements OnInit, AfterViewInit {
  readonly task = input<Task | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);

  readonly saved = output<TaskPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly statuses = STATUSES;
  protected readonly priorities = PRIORITIES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/\S/)]],
    description: ['', Validators.maxLength(1000)],
    status: ['TODO' as Status, Validators.required],
    priority: ['MEDIUM' as Priority, Validators.required],
  });

  protected get title() {
    return this.form.controls.title;
  }

  ngOnInit(): void {
    const t = this.task();
    if (t) {
      this.form.patchValue({
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        priority: t.priority,
      });
    }
  }

  ngAfterViewInit(): void {
    this.host.nativeElement.querySelector<HTMLInputElement>('#title')?.focus();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saved.emit({
      title: v.title.trim(),
      description: v.description.trim() || null,
      status: v.status,
      priority: v.priority,
      createdAt: new Date().toISOString()
    });
  }
}
