import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { TaskService } from './tasks/task.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: TaskService, useValue: { getAll: () => of([]) } }],
    }).compileComponents();
  });

  it('should render the tasks page and empty state', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Mes tâches');
    expect(compiled.textContent).toContain('Aucune tâche pour le moment');
  });
});
