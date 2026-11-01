import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PRIORITY_LABELS, STATUS_LABELS, Task } from '../task.model';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="grid">
      @for (t of tasks(); track t.id) {
        <li class="card">
          <div class="top">
            <span class="badge" [class]="'status-' + t.status">{{ statusLabels[t.status] }}</span>
            <span class="pill" [class]="'prio-' + t.priority">{{ priorityLabels[t.priority] }}</span>
          </div>
          <h3>{{ t.title }}</h3>
          @if (t.description) {
            <p class="desc">{{ t.description }}</p>
          }
          <div class="foot">
            <span class="date">Créée le {{ t.createdAt | date: 'd MMM y' }}</span>
            <span class="actions">
              <button type="button" class="btn small" (click)="edit.emit(t)"
                [attr.aria-label]="'Modifier ' + t.title" [disabled]="deletingId() === t.id">
                Modifier
              </button>
              <button type="button" class="btn small danger" (click)="remove.emit(t)"
                [attr.aria-label]="'Supprimer ' + t.title" [disabled]="deletingId() === t.id">
                {{ deletingId() === t.id ? 'Suppression…' : 'Supprimer' }}
              </button>
            </span>
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    .grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    .card { display: flex; flex-direction: column; gap: 10px; padding: 16px;
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .badge { padding: 2px 10px; border-radius: 6px; color: #fff; font-size: .8rem; font-weight: 600; }
    .status-TODO { background: var(--todo); }
    .status-IN_PROGRESS { background: var(--progress); }
    .status-DONE { background: var(--done); }
    .status-OVERDUE { background: var(--overdue); }
    .pill { padding: 1px 10px; border-radius: 999px; border: 1px solid currentColor; font-size: .8rem; }
    .prio-LOW { color: var(--low); }
    .prio-MEDIUM { color: var(--medium); }
    .prio-HIGH { color: var(--high); }
    h3 { margin: 0; font-size: 1.05rem; }
    .desc { margin: 0; color: var(--muted); font-size: .9rem; }
    .foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center;
      gap: 8px; flex-wrap: wrap; }
    .date { color: var(--muted); font-size: .85rem; }
    .actions { display: flex; gap: 6px; }
  `,
})
export class TaskListComponent {
  readonly tasks = input.required<Task[]>();
  readonly deletingId = input<number | null>(null);
  readonly edit = output<Task>();
  readonly remove = output<Task>();

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;
}
