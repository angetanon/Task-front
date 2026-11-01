import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { STATUSES, STATUS_LABELS, StatusFilter } from '../task.model';

@Component({
  selector: 'app-task-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chips" role="group" aria-label="Filtrer par statut">
      @for (o of options; track o.value) {
        <button
          type="button"
          class="chip"
          [class.active]="o.value === current()"
          [attr.aria-pressed]="o.value === current()"
          (click)="changed.emit(o.value)"
        >
          {{ o.label }} <span class="count">{{ counts()[o.value] }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px;
      border: 1px solid var(--border); border-radius: 999px;
      background: var(--surface); color: var(--text); font: inherit; cursor: pointer;
    }
    .chip:hover { border-color: var(--primary); }
    .chip.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    .count { font-size: .8em; opacity: .85; font-variant-numeric: tabular-nums; }
  `,
})
export class TaskFilterComponent {
  readonly current = input.required<StatusFilter>();
  readonly counts = input.required<Record<StatusFilter, number>>();
  readonly changed = output<StatusFilter>();

  protected readonly options: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Toutes' },
    ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  ];
}
