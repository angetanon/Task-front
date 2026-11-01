import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';
import { ApiError } from '../tasks/task.model';

/**
 * - Rejoue une fois les GET en cas d'erreur réseau ou 5xx.
 * - Convertit toute HttpErrorResponse en ApiError au message lisible,
 *   pour que les composants n'aient jamais à connaître HTTP.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    retry({
      count: 1,
      delay: (err: HttpErrorResponse) =>
        req.method === 'GET' && (err.status === 0 || err.status >= 500)
          ? timer(500)
          : throwError(() => err),
    }),
    catchError((err: HttpErrorResponse) => throwError(() => toApiError(err))),
  );

function toApiError(err: HttpErrorResponse): ApiError {
  const serverMessage: string | undefined = err.error?.message;

  if (err.status === 0) {
    return { status: 0, message: 'Le serveur est injoignable. Vérifiez que l’API est démarrée.' };
  }
  if (err.status === 400) {
    return { status: 400, message: serverMessage ?? 'Les données envoyées sont invalides.' };
  }
  if (err.status === 404) {
    return { status: 404, message: 'Cette tâche n’existe plus. Actualisez la liste.' };
  }
  if (err.status >= 500) {
    return { status: err.status, message: 'Erreur côté serveur. Réessayez dans un instant.' };
  }
  return { status: err.status, message: `Erreur inattendue (code ${err.status}).` };
}
