export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastMessage {
  severity: ToastSeverity;
  summary: string;
  detail?: string;
  life?: number; // durata in ms
  sticky?: boolean;
  id?: string;
}

export interface HttpErrorContext {
  url?: string;
  method?: string;
  status?: number;
  message?: string;
}