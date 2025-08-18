import { Injectable, Optional, Inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { ToastMessage, HttpErrorContext } from './toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messageSubject = new Subject<ToastMessage>();
  
  // Per le app che non hanno PrimeNG direttamente
  message$ = this.messageSubject.asObservable();

  constructor(@Optional() @Inject(MessageService) private messageService?: MessageService) {}

  private show(message: ToastMessage) {
    // Se abbiamo PrimeNG disponibile, usa quello
    if (this.messageService) {
      this.messageService.add(message);
    }
    // Altrimenti emetti via Subject per le altre app
    this.messageSubject.next(message);
  }

  showHttpError(error: HttpErrorContext, customMessage?: string) {
    const message: ToastMessage = {
      severity: 'error',
      summary: 'Errore HTTP',
      detail: customMessage || this.getErrorMessage(error),
      life: 5000
    };
    this.show(message);
  }

  showSuccessMessage(message: ToastMessage) {
    const successMessage: ToastMessage = {
      severity: 'success',
      summary: 'Successo',
      detail: message.detail,
      life: 3000
    };
    this.show(message);
  }

  showErrorMessage(message: ToastMessage) {
    const errorMessage: ToastMessage = {
      severity: 'error',
      summary: 'Errore',
      detail: message.detail,
      life: 3000
    };
    this.show(errorMessage);
  }

  private getErrorMessage(error: HttpErrorContext): string {
    if (error.status === 0) return 'Impossibile connettersi al server';
    if (error.status === 404) return 'Risorsa non trovata';
    if (error.status === 500) return 'Errore interno del server';
    return error.message || 'Si è verificato un errore';
  }
}