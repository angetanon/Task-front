export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type StatusFilter = Status | 'ALL';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  createdAt: string;
}

/** Ce que le formulaire envoie : l'id est géré par le serveur. */
export type TaskPayload = Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'createdAt'>;

export interface ApiError {
  status: number;
  message: string;
}

export const STATUS_LABELS: Record<Status, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
  OVERDUE: 'En retard',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
};

export const STATUSES = Object.keys(STATUS_LABELS) as Status[];
export const PRIORITIES = Object.keys(PRIORITY_LABELS) as Priority[];
