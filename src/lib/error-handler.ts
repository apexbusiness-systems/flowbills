import { toast } from "@/hooks/use-toast";

export interface AppError {
  code: string;
  message: string;
  details?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handle(error: AppError | Error | unknown) {
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        code: 'GENERAL_ERROR',
        message: error.message,
        details: error.stack,
        severity: 'error'
      };
    } else if (this.isAppError(error)) {
      appError = error;
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: error,
        severity: 'error'
      };
    }

    this.logError(appError);
    this.notifyUser(appError);
    
    // Report to monitoring service in production
    this.reportError(appError);
  }

  private isAppError(error: any): error is AppError {
    return error && 
           typeof error.code === 'string' && 
           typeof error.message === 'string' &&
           typeof error.severity === 'string';
  }

  private logError(error: AppError) {
    this.errorLog.push({
      ...error,
      timestamp: new Date().toISOString()
    } as any);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    console.error(`[${error.severity.toUpperCase()}] ${error.code}: ${error.message}`, error.details);
  }

  private notifyUser(error: AppError) {
    if (error.severity === 'critical' || error.severity === 'error') {
      toast({
        title: "Error",
        description: this.getUserFriendlyMessage(error),
        variant: "destructive",
      });
    } else if (error.severity === 'warning') {
      toast({
        title: "Warning",
        description: error.message,
      });
    }
  }

  private getUserFriendlyMessage(error: AppError): string {
    const friendlyMessages: Record<string, string> = {
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'NETWORK_ERROR': 'Network connection issue. Please try again.',
      'FILE_UPLOAD_ERROR': 'File upload failed. Please check file size and format.',
      'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment.',
      'PERMISSION_ERROR': 'You do not have permission to perform this action.',
      'SESSION_EXPIRED': 'Your session has expired. Please log in again.',
      'DATA_CORRUPTION': 'Data integrity issue detected. Please contact support.',
    };

    return friendlyMessages[error.code] || error.message;
  }

  private reportError(error: AppError) {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Would integrate with services like Sentry, LogRocket, etc.
      console.log('Would report to monitoring service:', error);
    }
  }

  getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog.slice(-limit);
  }

  clearErrors() {
    this.errorLog = [];
  }
}

// Predefined error types for consistency
export const ErrorTypes = {
  VALIDATION: (message: string, details?: any): AppError => ({
    code: 'VALIDATION_ERROR',
    message,
    details,
    severity: 'error'
  }),

  NETWORK: (message: string, details?: any): AppError => ({
    code: 'NETWORK_ERROR',
    message,
    details,
    severity: 'error'
  }),

  FILE_UPLOAD: (message: string, details?: any): AppError => ({
    code: 'FILE_UPLOAD_ERROR',
    message,
    details,
    severity: 'error'
  }),

  RATE_LIMIT: (message: string = 'Rate limit exceeded'): AppError => ({
    code: 'RATE_LIMIT_ERROR',
    message,
    severity: 'warning'
  }),

  PERMISSION: (message: string = 'Permission denied'): AppError => ({
    code: 'PERMISSION_ERROR',
    message,
    severity: 'error'
  }),

  DATA_CORRUPTION: (message: string, details?: any): AppError => ({
    code: 'DATA_CORRUPTION',
    message,
    details,
    severity: 'critical'
  })
};

export const errorHandler = ErrorHandler.getInstance();
