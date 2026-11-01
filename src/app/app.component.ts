import { Component } from '@angular/core';
import { TasksPageComponent } from './tasks/tasks-page.component';

@Component({
  selector: 'app-root',
  imports: [TasksPageComponent],
  template: `<app-tasks-page />`,
})
export class AppComponent {}
